const util = require('util');
const chalk = require('chalk');
const Immutable = require('immutable');
const fs = require('fs');
const generator = require('yeoman-generator');
const packagejs = require('../../package.json');
const semver = require('semver');
const BaseGenerator = require('../common');
const EntityGenerator = require('../shared');
const jhipsterConstants = require('generator-jhipster/generators/generator-constants');

const JhipsterGenerator = generator.extend({});
util.inherits(JhipsterGenerator, BaseGenerator);

module.exports = JhipsterGenerator.extend({
    initializing: {
        readConfig() {
            this.jhipsterAppConfig = this.getJhipsterAppConfig();
            if (!this.jhipsterAppConfig) {
                this.error('Can\'t read .yo-rc.json');
            }
        },
        displayLogo() {
            // it's here to show that you can use functions from generator-jhipster
            // this function is in: generator-jhipster/generators/generator-base.js
            this.printJHipsterLogo();

            // Have Yeoman greet the user.
            this.log(`\nWelcome to the ${chalk.bold.yellow('JHipster string-converter')} generator! ${chalk.yellow(`v${packagejs.version}\n`)}`);
        },
        checkJhipster() {
            const jhipsterVersion = this.jhipsterAppConfig.jhipsterVersion;
            const minimumJhipsterVersion = packagejs.dependencies['generator-jhipster'];
            if (!semver.satisfies(jhipsterVersion, minimumJhipsterVersion)) {
                this.warning(`\nYour generated project used an old JHipster version (${jhipsterVersion})... you need at least (${minimumJhipsterVersion})\n`);
            }
        }
    },

    prompting() {
        const prompts = [];
        const done = this.async();
        this.prompt(prompts).then((props) => {
            this.props = props;
            // To access props later use this.props.someOption;

            done();
        });
    },

    writing() {
        // function to use directly template
        this.template = function (source, destination) {
            this.fs.copyTpl(
                this.templatePath(source),
                this.destinationPath(destination),
                this
            );
        };

        // function to check if this generator has already run or not.
        this.isFirstRun = function () {
            return true;
        };

        // read config from .yo-rc.json
        this.baseName = this.jhipsterAppConfig.baseName;
        this.packageName = this.jhipsterAppConfig.packageName;
        this.packageFolder = this.jhipsterAppConfig.packageFolder;
        this.clientFramework = this.jhipsterAppConfig.clientFramework;
        this.clientPackageManager = this.jhipsterAppConfig.clientPackageManager;
        this.buildTool = this.jhipsterAppConfig.buildTool;

        // use function in generator-base.js from generator-jhipster
        // this.angularAppName = this.getAngularAppName();

        // use constants from generator-constants.js
        const javaDir = `${jhipsterConstants.SERVER_MAIN_SRC_DIR + this.packageFolder}/`;
        const javaTestDir = `${jhipsterConstants.SERVER_TEST_SRC_DIR + this.packageFolder}/`;
        // const resourceDir = jhipsterConstants.SERVER_MAIN_RES_DIR;
        // const webappDir = jhipsterConstants.CLIENT_MAIN_SRC_DIR;

        // variable from questions
        this.message = this.props.message;
        /*
         * Because this generator will be executed after JDL imported, here you should see .jhipster folder under current
         */
        // Scan current folder to read json
        console.info('[Zero] This tool is for microservice architecture only without "Front-End" modification.');
        const configDir = '.jhipster';
        const entities = [];
        fs.readdir(configDir, (err, files) => {
            // Read files
            if (!err) {
                files.forEach((filename) => {
                    if (!filename.startsWith('.') && filename.endsWith('json')) {
                        const entity = filename.split('.')[0];
                        entities.push(entity);
                    }
                });
            }
            const $entities = Immutable.fromJS(entities);
            // Scan all domain folder
            const domainDir = `${javaDir}domain`;
            fs.readdir(domainDir, (err, files) => {
                if (err) {
                    throw new Error(err);
                } else {
                    files.forEach((filename) => {
                        const hitted = filename.split('.')[0];
                        if ($entities.contains(hitted)) {
                            /**
                             * This code will be executed after import jdl file
                             * Step 1: jhipster import-jdl <fileName>
                             * Step 2: yo jhipster-string-converter
                             */
                            EntityGenerator.processEntity(this, javaDir, javaTestDir, hitted);
                            EntityGenerator.processLiquibase(this, javaDir, hitted, true);
                        }
                    });
                }
            });
        });

        /**
         * This code is for UAA configured, Modified User only
         */
        EntityGenerator.processEntity(this, javaDir, javaTestDir, 'User');
        EntityGenerator.processLiquibase(this, javaDir, 'User', true);
        console.info('[Zero] Successfully modified all the entities.', entities);
        try {
            this.registerModule('generator-jhipster-string-converter', 'entity', 'post', 'entity', 'Long to String converter');
        } catch (err) {
            this.log(`${chalk.red.bold('WARN!')} Could not register as a jhipster entity post creation hook...\n`);
        }
    },

    install() {
        let logMsg =
            `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install`)}`;

        if (this.clientFramework === 'angular1') {
            logMsg =
                `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install & bower install`)}`;
        }
        const injectDependenciesAndConstants = (err) => {
            if (err) {
                this.warning('Install of dependencies failed!');
                this.log(logMsg);
            } else if (this.clientFramework === 'angular1') {
                this.spawnCommand('gulp', ['install']);
            }
        };
        const installConfig = {
            bower: this.clientFramework === 'angular1',
            npm: this.clientPackageManager !== 'yarn',
            yarn: this.clientPackageManager === 'yarn',
            callback: injectDependenciesAndConstants
        };
        if (this.options['skip-install']) {
            this.log(logMsg);
        } else {
            this.installDependencies(installConfig);
        }
    },

    end() {
        this.log('End of postgresstring-converter generator');
    }
});
