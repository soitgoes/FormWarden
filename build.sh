# formwarden.js
cat ./formwarden.js > ./build.tmp
echo ";" >> ./build.tmp
java -jar ./lib/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js ./build.tmp --js_output_file ./build/formwarden.min.js

# Combined minification
cat ./jquery.formwarden.js >> ./build.tmp
echo ";" >> build.tmp # just to be safe
java -jar ./lib/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js ./build.tmp --js_output_file ./build/jquery.formwarden-pack.min.js
rm ./build.tmp