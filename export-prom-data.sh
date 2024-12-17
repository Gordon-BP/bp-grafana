#!/bin/bash

# Replace with your own info!
# Login credentials and Prometheus endpoint
# See https://grafana.com/blog/2024/03/21/how-to-use-http-apis-to-send-metrics-and-logs-to-grafana-cloud/ for info on how to get these data
login="userId:apiKey"
url="https://prometheus.<YOUR_URL_HERE>.grafana.net/api/prom"

# Output CSV file
output_file="metrics_export.csv"

# Debug log file
debug_log="metrics_export_debug.log"

# Usage function
usage() {
    echo "Usage: $0 [start_date] [end_date]"
    echo "Date formats:"
    echo "  - YYYY-MM-DD"
    echo "  - YYYY/MM/DD"
    echo "  - MM/DD/YYYY"
    echo "  - Relative dates like '7 days ago', 'yesterday', 'today'"
    echo "If no dates provided, defaults to last 7 days"
    exit 1
}

# Parse and validate dates
parse_date() {
    local input_date="$1"
    local parsed_date=""

    # If no date provided, use default
    if [ -z "$input_date" ]; then
        parsed_date=$(date -d "7 days ago" +%s)
    else
        # Try parsing with various formats
        parsed_date=$(date -d "$input_date" +%s 2>/dev/null)
    fi

    # Check if date parsing was successful
    if [ -z "$parsed_date" ]; then
        echo "Invalid date: $input_date" >&2
        usage
    fi

    echo "$parsed_date"
}

# Set time range
# If you're not US East coast, change this
TZ="America/New_York"
start_date=$(parse_date "${1:-7 days ago}")
end_date=$(parse_date "${2:-today}")

# Ensure start date is before end date
if [ "$start_date" -ge "$end_date" ]; then
    echo "Start date must be before end date" >&2
    exit 1
fi

# Write CSV header (if the file doesn't exist or is empty)
if [ ! -s "$output_file" ]; then
    echo "dateTime,botId,channel,conversationId,userId,metricName,value" > "$output_file"
fi

step="1m"

# Enhanced metric name fetching with detailed debugging
fetch_metric_names() {
    local metrics_response
    metrics_response=$(curl -v -s -u "$login" "$url/api/v1/label/__name__/values" 2>> "$debug_log")
    
    # Log the full response for debugging
    echo "Full metrics response:" >> "$debug_log"
    echo "$metrics_response" >> "$debug_log"
    
    # Extract and parse metric names
    local parsed_metrics
    parsed_metrics=$(echo "$metrics_response" | jq -r ".data[]" 2>> "$debug_log")
    
    # Log parsed metrics
    echo "Parsed metrics:" >> "$debug_log"
    echo "$parsed_metrics" >> "$debug_log"
    
    echo "$parsed_metrics"
}

# Fetch all metric names
mapfile -t metrics < <(fetch_metric_names)

# Verify metrics array
echo "Total metrics found: ${#metrics[@]}" >> "$debug_log"
printf "First few metrics: %s\n" "${metrics[@]:0:5}" >> "$debug_log"

# Progress bar function
update_progress() {
    local completed=$1
    local total=$2
    local percent=$((100 * completed / total))
    local progress_bar_width=50
    local filled=$((progress_bar_width * completed / total))
    local empty=$((progress_bar_width - filled))
    printf "\r[%-${progress_bar_width}s] %d%% (%d/%d)" "$(printf '#%.0s' $(seq 1 $filled))" "$percent" "$completed" "$total"
}

# Log date range for debugging
echo "Exporting metrics from $(date -d @"$start_date") to $(date -d @"$end_date")" >> "$debug_log"

# Main export loop
echo "Fetching data from Grafana..."
total_metrics=${#metrics[@]}
processed_metrics=0

# Iterate through metrics
for metric in "${metrics[@]}"; do
    # Skip empty metric names
    [[ -z "$metric" ]] && continue
    
    # Debug log for current metric
    echo "Processing metric: $metric" >> "$debug_log"
    
    # Query for the specific metric
    response=$(curl -s --get \
        -u "$login" \
        --data-urlencode "query=max_over_time({__name__=\"$metric\"}[$step])" \
        --data-urlencode "start=$start_date" \
        --data-urlencode "end=$end_date" \
        --data-urlencode "step=$step" \
        "$url/api/v1/query_range")
    
    # Log raw response
    echo "Response for $metric:" >> "$debug_log"
    echo "$response" >> "$debug_log"
    
    # Check if the response contains valid data
    if echo "$response" | jq -e '.data.result | length > 0' > /dev/null; then
        echo "$response" | jq -c '.data.result[]' | while read -r result; do
            unique_values=$(echo "$result" | jq -c '[.values[]] | unique')
            
            if [ "$unique_values" != "null" ] && [ "$unique_values" != "[]" ]; then
                echo "$unique_values" | jq -c '.[]' | while read -r value; do
                    timestamp=$(echo "$value" | jq -r '.[0]')
                    dateTime=$(TZ=$TZ date -d "@$timestamp" +%Y-%m-%dT%H:%M:%S%z)
                    metricValue=$(echo "$value" | jq -r '.[1]')
                    
                    # Extract additional metadata
                    botId=$(echo "$result" | jq -r '.metric.botId // "N/A"')
                    channel=$(echo "$result" | jq -r '.metric.channel // "N/A"')
                    conversationId=$(echo "$result" | jq -r '.metric.conversationId // "N/A"')
                    userId=$(echo "$result" | jq -r '.metric.userId // "N/A"')
                    
                    # Write to CSV
                    echo "$dateTime,$botId,$channel,$conversationId,$userId,$metric,$metricValue" >> "$output_file"
                done
            fi
        done
    fi
    
    # Update progress
    processed_metrics=$((processed_metrics + 1))
    update_progress "$processed_metrics" "$total_metrics"
done

# Final progress bar update
update_progress "$total_metrics" "$total_metrics"
echo -e "\nData export complete! Check $output_file and $debug_log for details."
