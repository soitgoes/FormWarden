copy NUL build.tmp
more formwarden.js > build.tmp
echo ; >> build.tmp
java -jar ./lib/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js ./build.tmp --js_output_file ./build/formwarden.min.js


more jquery.formwarden.js >> build.tmp
echo ; >> build.tmp
java -jar ./lib/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js ./build.tmp --js_output_file ./build/jquery.formwarden.min.js
del build.tmp