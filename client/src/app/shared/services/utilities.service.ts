import { Injectable } from '@angular/core';

@Injectable()
export class UtilitiesService {

    // http://stackoverflow.com/q/8019534/3234163
    highlightText(e: Element) {
        const range = document.createRange();
        range.selectNodeContents(e);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    unHighlightText() {
        const sel = window.getSelection();
        sel.removeAllRanges();
    }

    // https://www.reddit.com/r/web_design/comments/33kxgf/javascript_copying_to_clipboard_is_easier_than
    copyContentToClipboard(text: string) {
        const textField = document.createElement('textarea');
        textField.innerText = text;
        document.body.appendChild(textField);
        textField.select();
        document.execCommand('copy');
        textField.remove();
    }
}
