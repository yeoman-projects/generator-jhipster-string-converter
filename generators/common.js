const BaseGenerator = require('generator-jhipster/generators/generator-base');

module.exports = class extends BaseGenerator {

    importUUID(file, importNeedle = 'import java.util.List;') {
        this.replaceContent(file, importNeedle, `${importNeedle}\nimport java.util.UUID;`);
    }

    longToUUID(file) {
        this.importUUID(file, 'import java.util.Objects;');
        this.replaceContent(file, 'Long', 'UUID', true);
    }

    longToString(file) {
        this.replaceContent(file, 'Long', 'String', true);
    }

    convertIDtoUUIDForColumn(file, importNeedle, columnName) {
        this.replaceContent(file, '@GeneratedValue.*', '@GeneratedValue', true);
        this.replaceContent(file, '.*@SequenceGenerator.*\n', '', true);
        this.longToUUID(file);
    }

    convertIDtoStringForColumn(file, importNeedle, columnName) {
        this.replaceContent(file, '@GeneratedValue.*IDENTITY*', '@GeneratedValue(generator = "uuid")\n\t@GenericGenerator(name = "uuid", strategy = "uuid2"', true);
        this.replaceContent(file, '.*@SequenceGenerator.*\n', '', true);
        this.longToString(file);
    }
};

