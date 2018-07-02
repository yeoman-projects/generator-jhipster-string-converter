const util = require('util');
const chalk = require('chalk');
const glob = require('glob');
const generator = require('yeoman-generator');
const packagejs = require(`${__dirname}/../../package.json`);
const semver = require('semver');
const BaseGenerator = require('../common');
const jhipsterConstants = require('generator-jhipster/generators/generator-constants');
const _s = require('underscore.string');
const fs = require('fs');
const EntityGenerator = require('../shared');
const JhipsterGenerator = generator.extend({});
util.inherits(JhipsterGenerator, BaseGenerator);

module.exports = JhipsterGenerator.extend({
    initializing: {
        readConfig() {
            this.jhipsterAppConfig = this.getJhipsterAppConfig();
            if (!this.jhipsterAppConfig) {
                this.error('Can\'t read .yo-rc.json');
            }
            this.entityConfig = this.options.entityConfig;
        },
        displayLogo() {
            this.log(chalk.white(`Running ${chalk.bold('JHipster postgresstring-converter')} Generator! ${chalk.yellow(`v${packagejs.version}\n`)}`));
        },
        validate() {
            // this shouldn't be run directly
            if (!this.entityConfig) {
                this.env.error(`${chalk.red.bold('ERROR!')} This sub generator should be used only from JHipster and cannot be run directly...\n`);
            }
        }
    },

    prompting() {
        // don't prompt if data are imported from a file
        if (this.entityConfig.useConfigurationFile == true && this.entityConfig.data && typeof this.entityConfig.data.yourOptionKey !== 'undefined') {
            this.yourOptionKey = this.entityConfig.data.yourOptionKey;
            return;
        }
        const done = this.async();
        const prompts = [];

        this.prompt(prompts).then((props) => {
            this.props = props;
            // To access props later use this.props.someOption;

            done();
        });
    },

    writing: {
        updateFiles() {
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
            const entityName = this.entityConfig.entityClass;
            // do your stuff here
            // check if repositories are already annotated
            const uuidGeneratorAnnotation = '@GeneratedValue.*"UUIDGenerator"';
            const pattern = new RegExp(uuidGeneratorAnnotation, 'g');

            const content = this.fs.read(`${javaDir}domain/${entityName}.java`, 'utf8');

            if (!pattern.test(content)) {
                // We need to convert this entity
                EntityGenerator.processEntity(this, javaDir, javaTestDir, entityName);
                // Convert with update module
                EntityGenerator.processLiquibase(this, javaDir, entityName, false);
            }
        },

        writeFiles() {
            // function to use directly template
            this.template = function (source, destination) {
                fs.copyTpl(
                    this.templatePath(source),
                    this.destinationPath(destination),
                    this
                );
            };
        },

        updateConfig() {
            this.updateEntityConfig(this.entityConfig.filename, 'yourOptionKey', this.yourOptionKey);
        }
    },

    end() {
        if (this.yourOptionKey) {
            this.log(`\n${chalk.bold.green('postgresstring-converter enabled')}`);
        }
    }
});
