const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const typescript = require('gulp-typescript');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsify = require('tsify');
const tsProject = typescript.createProject('tsconfig.json');
const tsBrowser = typescript.createProject('tsconfig.browser.json');
const srcGlobs = tsProject.config.include;
const publicGlobs = ["src/public/**/*"];

// Compile the device sources
async function buildDevice() {
    tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .on('error', (error) => { console.error(error.toString()); })
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(tsProject.options.outDir));
}

// Copy any pre-defined declarations
async function copyDecl() {
    const decDirs = [];
    srcGlobs.forEach((dir) => {
        decDirs.push(`${dir.split('/')[0]}/**/*.d.ts`);
    });
    gulp.src(decDirs)
        .pipe(gulp.dest(tsProject.options.declarationDir));
}

// Copy any other files
async function copyFiles() {
    const publicDirs = [];
    publicGlobs.forEach(dir => {
        publicDirs.push(`${dir.split('/')[0]}/**/*.css`);
        publicDirs.push(`${dir.split('/')[0]}/**/*.html`);
        publicDirs.push(`${dir.split('/')[0]}/**/*.png`);
        publicDirs.push(`${dir.split('/')[0]}/**/*.jpg`);
        publicDirs.push(`${dir.split('/')[0]}/**/*.ico`);
    })
    gulp.src(publicDirs)
        .pipe(gulp.dest(tsProject.options.outDir));
}

async function buildBrowser() {
    return browserify({
            basedir: '.',
            entries: ["src/features/browser/client.ts"],
            cache: {},
            
            packageCache: {}
        })
        .plugin(tsify, { p: "./tsconfig.browser.json" })
        .bundle()
        .on('error', function(error) { console.error(error.toString()); })
        .pipe(source('bundle.js'))
        .pipe(gulp.dest(tsBrowser.options.outDir));
}

exports.build = gulp.series(buildDevice, copyDecl, copyFiles, buildBrowser);