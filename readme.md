# DepScan - Dependency Audit CLI

A command-line tool that performs maintenance audits on your project dependencies by analyzing package age, repository status, and version stability.

```
 ██████   █████ ███████████  ██████   ██████   █████████                                     █████
░░██████ ░░███ ░░███░░░░░███░░██████ ██████   ███░░░░░███                                   ░░███ 
 ░███░███ ░███  ░███    ░███ ░███░█████░███  ███     ░░░  █████ ████  ██████   ████████   ███████ 
 ░███░░███░███  ░██████████  ░███░░███ ░███ ░███         ░░███ ░███  ░░░░░███ ░░███░░███ ███░░███ 
 ░███ ░░██████  ░███░░░░░░   ░███ ░░░  ░███ ░███    █████ ░███ ░███   ███████  ░███ ░░░ ░███ ░███ 
 ░███  ░░█████  ░███         ░███      ░███ ░░███  ░░███  ░███ ░███  ███░░███  ░███     ░███ ░███ 
 █████  ░░█████ █████        █████     █████ ░░█████████  ░░████████░░████████ █████    ░░████████
░░░░░    ░░░░░ ░░░░░        ░░░░░     ░░░░░   ░░░░░░░░░    ░░░░░░░░  ░░░░░░░░ ░░░░░      ░░░░░░░░ 
```

## Features

- Scans all dependencies and devDependencies in your package.json
- Checks for:
  - Packages with releases older than a specified period
  - Repositories without recent commits (12+ months)
  - Archived GitHub repositories
  - Pre-1.0.0 (potentially unstable) versions
- Provides a clear, color-coded table output of findings
- Customizable audit timeframe

## Installation and Usage

```bash
npm i -g npmguard 
```
What you are doing is install the dependencies of npmguard and install npmguard globally in your system.

### Options

- `-m, --months <number>`: Number of months to look back for latest releases (default: 12)
- `-p, --path <path>`: Path to the directory containing package.json (default: current directory)
- `-h, --help`: Display help information
- `-v, --version`: Display version information

Example with options:

```bash
npmguard start -m 6 -p ./my-project
```

## Output Legend

The tool uses the following icons to indicate different types of issues:

- ⏰ Repository not actively maintained (no commits in last 12 months)
- 🚧 Pre-1.0.0 version (potentially unstable)
- 📦 Archived repository
- 📅 Old release (older than specified months)
- ❗ Other issues

## Example Output

```
📋 Dependency audit with following criteria:
- Last release older than 12 months
- Last commit older than 12 months
- Repository not archived
- Version not pre 1.0.0

🚨 Dependency issues:
┌────────────────────────────┬───────────────┬───────────────────────────────┐
│ Package                    │ Version       │ Issues                        │
├────────────────────────────┼───────────────┼───────────────────────────────┤
│ example-package            │ 0.9.0         │ 🚧 Unstable version (0.9.0)   │
│                            │               │ 📅 Last release older than... │
└────────────────────────────┴───────────────┴───────────────────────────────┘

📊 Found 1 dependency issues.
```

## Requirements

- Node.js 14 or higher
- npm 6 or higher
- Internet connection (for GitHub repository checks)

## TO-DO
- [ ] Add support for a Whitelist to reduce noise (`.npmguardrc.json` with name and reason for skipping)
  - better in `JSON` format
  - with a validation function to check if some white listed package are not more used or has no more issue
  - show the white listed packages in the output
