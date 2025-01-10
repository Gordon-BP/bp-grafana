# Botpress Grafana Integration

By Gordy from [Hanakano](https://www.hanakano.com)

## What is it?

A Botpress integration that allows asynchronous sending of events to a Loki server, enabling visualization through dashboards in Grafana.

## Installation

### Nix

The project environment is also available via [Nix](https://nixos.org/), the deterministic package manager. It is not _required_ to use Nix to develop this project, but Nix is the most reliable way to do so.

1. Open a Nix shell with:
   ```bash
   nix develop
   ```
2. Alternatively, use [direnv](https://github.com/nix-community/nix-direnv) for automatic setup:
   ```bash
   echo "use flake" > .envrc
   direnv allow
   ```
### Bun

[Bun](https://bun.sh/) is a fast and efficient JavaScript package manager. You don't _have_ to use Bun for this project, but it is recommended. To install dependencies with Bun, run:

```bash
bun install
```

If you prefer npm or pnpm, they also work:

```bash
npm install
```

or

```bash
pnpm install
```


## TODOs

- [x] Use batch processing for the export shell script
- [ ] Make a video tutorial and embed it in the documentation & embed it in docs
