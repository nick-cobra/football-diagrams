/** Transport envelope for untrusted JSON strings, before allocating a JSON tree.
 * Covers the fully populated canonical v1 document, including escaped strings. */
const MAX_LENGTH = 8 * 1024 * 1024;
const MAX_TOKENS = 262_144;
const MAX_DEPTH = 32;
export function checkJsonResources(source) {
    if (source.length > MAX_LENGTH)
        throw new RangeError('Diagram JSON exceeds 8 Mi UTF-16 code units');
    const stack = [];
    let tokens = 0;
    const token = () => { if (++tokens > MAX_TOKENS)
        throw new RangeError('Diagram JSON exceeds 262144 tokens'); };
    for (let i = 0; i < source.length;) {
        const c = source[i];
        if (c === '{' || c === '[') {
            token();
            stack.push(c);
            if (stack.length > MAX_DEPTH)
                throw new RangeError('Diagram JSON exceeds 32 container levels');
            i++;
        }
        else if (c === '}' || c === ']') {
            if (stack.pop() !== (c === '}' ? '{' : '['))
                throw new SyntaxError('Unmatched JSON container');
            i++;
        }
        else if (c === '"') {
            token();
            i++;
            while (i < source.length) {
                const next = source[i++];
                if (next === '\\')
                    i++;
                else if (next === '"')
                    break;
            }
        }
        else if (/[\s,:]/.test(c))
            i++;
        else {
            token();
            i++;
            while (i < source.length && !/[\s{}\[\],:"]/.test(source[i]))
                i++;
        }
    }
    if (stack.length)
        throw new SyntaxError('Unclosed JSON container');
}
