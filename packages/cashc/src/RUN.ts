import { compileString } from './compiler';

const code = `
contract N() {
    function test(){
        // int z = 5;
        string x, y = "What is Bitcoin Cash?".split(15);
        // string x = "What is Bitcoin Cash?".split(15)[0];
        // string y = "What is Bitcoin Cash?".split(15)[1];
        // string h = 'asd';
        require(x == y);
    }
}
`;

const art = compileString(code);
console.log(art);
