{
  description = "Development environment for the Grafana project with Bun and direnv";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
    bun.url = "github:JLevasseur/nix-bun"; # Community Bun flake
  };

  outputs = { self, nixpkgs, flake-utils, bun }: flake-utils.lib.eachDefaultSystem (system: let
    pkgs = import nixpkgs { inherit system; };
  in {
    devShell = pkgs.mkShell {
      name = "grafana-dev-shell";

      buildInputs = [
        bun.defaultPackage # Provides Bun
        pkgs.nodejs # Needed for some Node.js-related utilities
        pkgs.direnv # To manage environment variables and loading
      ];

      shellHook = ''
        eval "$(direnv hook bash)"
        export NODE_ENV=development
        echo "Development environment for Grafana project loaded."
      '';

      nativeBuildInputs = [ pkgs.nix-direnv ];
    };

    packages = {
      default = bun.defaultPackage;
    };
  });
}
