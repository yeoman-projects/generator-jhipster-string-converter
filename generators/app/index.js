const util = require('util');
const chalk = require('chalk');
const glob = require('glob');
const Immutable = require('immutable');
const fs = require('fs');
const generator = require('yeoman-generator');
const packagejs = require('../../package.json');
const semver = require('semver');
const BaseGenerator = require('../common');
const jhipsterConstants = require('generator-jhipster/generators/generator-constants');

const JhipsterGenerator = generator.extend({});
util.inherits(JhipsterGenerator, BaseGenerator);

const fnEntity = (reference, javaDir, javaTestDir, hitted) => {
    // Entity scanned
    reference.convertIDtoStringForColumn(`${javaDir}domain/${hitted}.java`, 'import java.time.Instant;', 'id');
    reference.replaceContent(`${javaDir}domain/${hitted}.java`, 'import java.io.Serializable;',
        'import org.hibernate.annotations.GenericGenerator;\nimport java.io.Serializable;', undefined);
    reference.replaceContent(`${javaDir}domain/${hitted}.java`, 'import org.hibernate.annotations.GenericGenerator;\nimport org.hibernate.annotations.GenericGenerator;',
        'import org.hibernate.annotations.GenericGenerator;', undefined);
    // DTO
    if (fs.existsSync(`${javaDir}service/dto/${hitted}DTO.java`)) {
        reference.longToString(`${javaDir}service/dto/${hitted}DTO.java`);
    }
    // Mapper
    if (fs.existsSync(`${javaDir}service/mapper/${hitted}Mapper.java`)) {
        reference.longToString(`${javaDir}service/mapper/${hitted}Mapper.java`);
    }
    // Replace the Repository
    reference.longToString(`${javaDir}repository/${hitted}Repository.java`);
    // Replace the Service/ServiceImpl
    if (fs.existsSync(`${javaDir}service/impl/${hitted}ServiceImpl.java`)) {
        reference.longToString(`${javaDir}service/impl/${hitted}ServiceImpl.java`);
    }
    reference.longToString(`${javaDir}service/${hitted}Service.java`);
    // Replace the Rest
    reference.longToString(`${javaDir}web/rest/${hitted}Resource.java`);
    // Tests
    reference.longToString(`${javaTestDir}web/rest/${hitted}ResourceIntTest.java`);
    reference.replaceContent(`${javaTestDir}web/rest/${hitted}ResourceIntTest.java`, '1L', '"1L"', true);
    reference.replaceContent(`${javaTestDir}web/rest/${hitted}ResourceIntTest.java`, '2L', '"2L"', true);
    reference.replaceContent(`${javaTestDir}web/rest/${hitted}ResourceIntTest.java`, '""', '"', true);
    reference.replaceContent(`${javaTestDir}web/rest/${hitted}ResourceIntTest.java`, /\("\)/g, '("")', true);
    reference.replaceContent(`${javaTestDir}web/rest/${hitted}ResourceIntTest.java`, /String\.MAX_VALUE/g, '"-1"', true);
    reference.replaceContent(`${javaTestDir}web/rest/${hitted}ResourceIntTest.java`, /getId\(\)\.intValue\(\)/g, 'getId()', false);
};
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
            this.log(`\nWelcome to the ${chalk.bold.yellow('JHipster postgresstring-converter')} generator! ${chalk.yellow(`v${packagejs.version}\n`)}`);
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
        // show all variables
        // this.log('\n--- some config read from config ---');
        // this.log(`baseName=${this.baseName}`);
        // this.log(`packageName=${this.packageName}`);
        // this.log(`clientFramework=${this.clientFramework}`);
        // this.log(`clientPackageManager=${this.clientPackageManager}`);
        // this.log(`buildTool=${this.buildTool}`);
        //
        // this.log('\n--- some function ---');
        // this.log(`angularAppName=${this.angularAppName}`);
        //
        // this.log('\n--- some const ---');
        // this.log(`javaDir=${javaDir}`);
        // this.log(`resourceDir=${resourceDir}`);
        // this.log(`webappDir=${webappDir}`);
        //
        // this.log('\n--- variables from questions ---');
        // this.log(`\nmessage=${this.message}`);
        // this.log('------\n');
        // Scan current folder to read json
        const configDir = '.jhipster';
        const entities = [];
        fs.readdir(configDir, (err, files) => {
            // Read files
            if (!err) {
                files.forEach((filename) => {
                    if (!filename.startsWith('.') && filename.endsWith('json')) {
                        const entity = filename.split('.')[0];
                        entities.push(entity);
                    } else {
                        console.info(`[Zero] ${filename} has been skipped!`);
                    }
                });
            }
            const $entities = Immutable.fromJS(entities);
            // Scan all domain folder
            const domainDir = `${javaDir}domain`;
            fs.readdir(domainDir, (err, files) => {
                if (err) {
                    console.info(err);
                } else {
                    files.forEach((filename) => {
                        const hitted = filename.split('.')[0];
                        if ($entities.contains(hitted)) {
                            // Each Entity
                            fnEntity(this, javaDir, javaTestDir, hitted);
                            // xml
                            // Liquibase
                            let file = glob.sync('src/main/resources/config/liquibase/changelog/*initial_schema.xml')[0];
                            this.replaceContent(file, 'type="bigint"', 'type="varchar(32)"', true);
                            this.replaceContent(file, 'autoIncrement="\\$\\{autoIncrement\\}"', '', true);
                            file = glob.sync(`src/main/resources/config/liquibase/changelog/*entity_${hitted}.xml`)[0];
                            this.replaceContent(file, 'type="bigint"', 'type="varchar(32)"', true);
                            this.replaceContent(file, 'autoIncrement="\\$\\{autoIncrement\\}"', '', true);
                        }
                    });
                }
            });
        });

        // UAA User
        fnEntity(this, javaDir, javaTestDir, 'User');

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
