import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default class PageLoader {
  constructor(url, dir) {
    this.url = new URL(url);
    this.dir = dir;
    this.filepath = this.getFilepath();
  }

  getHtml() {
    return axios(this.url.href);
  }

  getFilepath() {
    const filename = this.url.pathname.length === 1
      ? `${this.url.host.replaceAll('.', '-')}.html`
      : `${this.url.host.replaceAll('.', '-')}${this.url.pathname.replaceAll('/', '-')}.html`;
    const filepath = path.isAbsolute(this.dir)
      ? path.join(this.dir, filename)
      : path.join(process.cwd(), this.dir, filename);
    return filepath;
  }

  writeFile(data) {
    return fs.promises.writeFile(this.filepath, data);
  }
}
