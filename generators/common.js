const BaseGenerator = require('generator-jhipster/generators/generator-base');

module.exports = class extends BaseGenerator {

    longToString(file) {
        this.replaceContent(file, 'Long', 'String', true);
    }

    idToString(file) {
        this.replaceContent(file, '@GeneratedValue.*IDENTITY*', '@GeneratedValue(generator = "uuid")\n\t@GenericGenerator(name = "uuid", strategy = "uuid2"', true);
        this.replaceContent(file, '.*@SequenceGenerator.*\n', '', true);
        this.longToString(file);
    }
};

