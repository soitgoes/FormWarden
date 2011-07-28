# Combined minification
cat ./formwarden.js > ./build.tmp
echo ";" >> ./build.tmp #just to be safe
cat ./jquery.formwarden.js >> ./build.tmp
echo ";" >> build.tmp # just to be safe
java -jar ./lib/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js ./build.tmp --js_output_file ./jquery.formwarden.min.js
rm ./build.tmp

# formwarden.js
cat ./formwarden.js > ./build.tmp
echo ";" >> ./build.tmp
java -jar ./lib/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js ./build.tmp --js_output_file ./formwarden.min.js
rm build.tmp