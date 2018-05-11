const glob = require('glob');
const fs = require('fs');

const executeID = (reference, file, callback) => {
    if (fs.existsSync(file)) {
        reference.idToString(file);
        if (callback) {
            callback(file);
        }
    }
};

const executeField = (reference, file, callback) => {
    if (fs.existsSync(file)) {
        reference.longToString(file);
        if (callback) {
            callback(file);
        }
    }
};

module.exports = class {
    static processLiquibase(reference, javaDir, entityName, init = true) {
        if (init) {
            const file = glob.sync('src/main/resources/config/liquibase/changelog/*initial_schema.xml')[0];
            reference.replaceContent(file, 'type="bigint"', 'type="varchar(32)"', true);
            reference.replaceContent(file, 'autoIncrement="\\$\\{autoIncrement\\}"', '', true);
        }
        const file = glob.sync(`src/main/resources/config/liquibase/changelog/*entity_${entityName}.xml`)[0];
        reference.replaceContent(file, 'type="bigint"', 'type="varchar(32)"', true);
        reference.replaceContent(file, 'autoIncrement="\\$\\{autoIncrement\\}"', '', true);
    }

    static processEntity(reference, javaDir, javaTestDir, entityName) {
        // domain model
        executeID(reference, `${javaDir}domain/${entityName}.java`, (file) => {
            // Hibernate uuid generator
            reference.replaceContent(file, 'import java.io.Serializable;',
                'import org.hibernate.annotations.GenericGenerator;\nimport java.io.Serializable;', undefined);
            // Replace duplicated import of org.hibernate.annotations.GenericGenerator
            reference.replaceContent(file, 'import org.hibernate.annotations.GenericGenerator;\nimport org.hibernate.annotations.GenericGenerator;',
                'import org.hibernate.annotations.GenericGenerator;', undefined);
        });
        // DTO
        executeField(reference, `${javaDir}service/dto/${entityName}DTO.java`);
        // Mapper
        executeField(reference, `${javaDir}service/mapper/${entityName}Mapper.java`);
        // Repository
        executeField(reference, `${javaDir}repository/${entityName}Repository.java`);
        // TODO: Search Repository
        // Service
        executeField(reference, `${javaDir}service/${entityName}Service.java`, () =>
            executeField(reference, `${javaDir}service/impl/${entityName}ServiceImpl.java`));
        // Resource
        executeField(reference, `${javaDir}web/rest/${entityName}Resource.java`);
        // TestResource
        executeField(reference, `${javaTestDir}web/rest/${entityName}ResourceIntTest.java`, (file) => {
            reference.replaceContent(file, '1L', '"1L"', true);
            reference.replaceContent(file, '2L', '"2L"', true);
            reference.replaceContent(file, '""', '"', true);
            reference.replaceContent(file, /\("\)/g, '("")', true);
            reference.replaceContent(file, /String\.MAX_VALUE/g, '"-1"', true);
            reference.replaceContent(file, /getId\(\)\.intValue\(\)/g, 'getId()', false);
        });
        // TODO: JavaScript modification
    }
};
