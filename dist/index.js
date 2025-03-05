#!/usr/bin/env node
import fs from 'fs';
import { execSync } from 'child_process';
import { Command } from 'commander';
import Table from 'cli-table3';
import chalk from 'chalk';
import { checkPreOneVersion } from './lib/audit/checkPreOneVersion.js';
import { checkIfNotMaintained } from './lib/audit/checkIfNotMaintained.js';
import { hasToBeCheckedManually } from './lib/audit/hasToBeCheckedManually.js';
import { checkOldRelease } from './lib/audit/checkOldRelease.js';
import { checkIfArchived } from './lib/audit/checkIfArchived.js';
import { parseGitHubRepoUrl } from './lib/parseGithub.js';
const program = new Command();
async function checkDependencyMaintenance(options) {
    const packageJson = JSON.parse(fs.readFileSync(`${options.path}/package.json`, 'utf8'));
    const allDependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
    };
    let months = options.months || 12;
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    console.log(chalk.bold(`\n📋 Dependency audit with following criteria:`));
    console.log(`- Last release older than ${months} months`);
    console.log(`- Last commit older than 12 months`);
    console.log(`- Repository not archived`);
    console.log(`- Version not pre 1.0.0`);
    let totalChecked = 0;
    const totalDeps = Object.keys(allDependencies).length;
    const dependencyIssues = [];
    const toBeCheckedManually = [];
    let repoUrl;
    for (const [dep, rawVersion] of Object.entries(allDependencies)) {
        try {
            totalChecked++;
            process.stdout.write(`\nCheck package ${totalChecked}/${totalDeps}: ${dep}`);
            const npmInfo = JSON.parse(execSync(`npm view ${dep} --json`).toString()), issues = [];
            // 1. Check version 1.0
            const isPreOne = await checkPreOneVersion(rawVersion);
            if (isPreOne)
                issues.push(isPreOne);
            // 2. Check if there are problems with the repository URL
            if (hasToBeCheckedManually(npmInfo)) {
                toBeCheckedManually.push(dep);
                continue;
            }
            const repoInfo = parseGitHubRepoUrl(npmInfo.repository);
            repoUrl = `https://github.com/${repoInfo.username}/${repoInfo.repo}`;
            // 3. Check if repository is still maintained
            const isNotMaintained = await checkIfNotMaintained(npmInfo.repository);
            if (isNotMaintained)
                issues.push(isNotMaintained);
            // 4. Check if repository is archived
            const archived = await checkIfArchived(npmInfo);
            if (archived)
                issues.push(archived);
            // 5. Check if last release is too old
            const oldRelease = checkOldRelease(npmInfo, cutoffDate);
            if (oldRelease)
                issues.push(oldRelease);
            if (issues.length > 0) {
                dependencyIssues.push({
                    name: dep,
                    version: rawVersion,
                    url: repoUrl,
                    issues
                });
            }
        }
        catch (error) {
            console.error(`\nError while check package ${dep}:`, error);
        }
    }
    process.stdout.write('\n\n');
    if (dependencyIssues.length === 0) {
        console.log(chalk.green(`✅ No dependency issues found.`));
    }
    else {
        const table = new Table({
            head: [
                chalk.blue('Package'),
                chalk.blue('Version'),
                chalk.blue('Issues'),
                chalk.blue('Repo Url')
            ],
            colWidths: [30, 15, 80]
        });
        dependencyIssues.forEach(dep => {
            const issueDetails = dep.issues.map(issue => {
                let icon = '❗';
                switch (issue.type) {
                    case 'outdated':
                        icon = '⏰';
                        break;
                    case 'pre_1.0':
                        icon = '🚧';
                        break;
                    case 'archived_repo':
                        icon = '📦';
                        break;
                    case 'old_release':
                        icon = '📅';
                        break;
                }
                return `${icon} ${issue.details}`;
            }).join('\n');
            table.push([
                chalk.yellow(dep.name),
                chalk.green(dep.version),
                issueDetails,
                chalk.yellow(dep.url),
            ]);
        });
        console.log(chalk.bold(`\n🚨 Dependency issues:`));
        console.log(table.toString());
        console.log(`\n📊 Found ${dependencyIssues.length} dependency issues.`);
    }
    if (toBeCheckedManually.length > 0) {
        console.log(`\n🚨 Some dependencies must be manually checked: ${toBeCheckedManually.join(', ')}`);
    }
}
const ASCII_ART = `
 ██████   █████ ███████████  ██████   ██████   █████████                                     █████
░░██████ ░░███ ░░███░░░░░███░░██████ ██████   ███░░░░░███                                   ░░███ 
 ░███░███ ░███  ░███    ░███ ░███░█████░███  ███     ░░░  █████ ████  ██████   ████████   ███████ 
 ░███░░███░███  ░██████████  ░███░░███ ░███ ░███         ░░███ ░███  ░░░░░███ ░░███░░███ ███░░███ 
 ░███ ░░██████  ░███░░░░░░   ░███ ░░░  ░███ ░███    █████ ░███ ░███   ███████  ░███ ░░░ ░███ ░███ 
 ░███  ░░█████  ░███         ░███      ░███ ░░███  ░░███  ░███ ░███  ███░░███  ░███     ░███ ░███ 
 █████  ░░█████ █████        █████     █████ ░░█████████  ░░████████░░████████ █████    ░░████████
░░░░░    ░░░░░ ░░░░░        ░░░░░     ░░░░░   ░░░░░░░░░    ░░░░░░░░  ░░░░░░░░ ░░░░░      ░░░░░░░░ 
`;
program
    .name('depaudit')
    .description(`${ASCII_ART}\n\nA little CLI to make a dependency audit of your package.json.`)
    .version('1.0.0');
program
    .command('start')
    .option('-m, --months <months>', 'Number of months to look back', parseInt)
    .option('-p, --path <path>', 'Path to the package.json file', '.')
    .description('Start the audit.')
    .action(checkDependencyMaintenance);
program.parse(process.argv);
