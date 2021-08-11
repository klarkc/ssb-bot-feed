/**
 *  Get length of a string in UTF8 Bytes
 * 
 * @param str the string
 */
export default function stringLength(str) {
    // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
    var m = encodeURIComponent(str).match(/%[89ABab]/g);
    return str.length + (m ? m.length : 0);
}