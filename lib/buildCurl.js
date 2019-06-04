export default function buildCurl(options) {
    const { uri, method, headers, body } = options;
    const headerTokens = Object.keys(headers).map(key =>  `-H  "${key}:${headers[key]}"`);
    return `curl -X ${method} ${headerTokens.join(' ')} -d '${body}' ${uri}`;
}
