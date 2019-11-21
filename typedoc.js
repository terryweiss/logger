module.exports = {
    mode: "modules",
    module: "commonjs",
    target: "es6",
    name: "logger",
    theme: "default",
    excludeNotExported: true,
    excludePrivate: true,
    includeDeclarations: false,
    exclude: [
        "*/src/types/index.d.ts"
    ]
};



