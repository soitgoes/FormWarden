# Combined minification
cat ./formwarden.js > build.tmp
cat ./jquery.formwarden.js >> build.tmp
java -jar ./lib/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js ./build.tmp --js_output_file ./jquery.formwarden.min.js
rm build.tmp

# formwarden.js
java -jar ./lib/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js ./formwarden.js --js_output_file ./formwarden.min.js