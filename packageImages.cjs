/* eslint-disable */
const compressing = require('compressing');
const fs = require('fs');
const { join } = require('path');

const tarStream = new compressing.tar.Stream();

if(fs.existsSync(join(process.cwd(), 'wiki.tar'))) {
	fs.unlinkSync(join(process.cwd(), 'wiki.tar'));
}

function addAllPngToStream(path) {
	  const scanResult = fs.readdirSync(path, { withFileTypes: true })
	  for (const item of scanResult) {
	    if (item.isFile() && item.name.toLowerCase().endsWith('.png'.toLowerCase())) {
	      tarStream.addEntry(join(path, item.name), {
				relativePath: join(path.replace(join(process.cwd()), ''), item.name).replaceAll('\\', '/').substr(1)
		  });
	    } else if (item.isDirectory()) {
	      addAllPngToStream(join(path, item.name));
	    }
	}
}

addAllPngToStream(join(process.cwd(), 'public/sf'));

tarStream
  .on('error', console.log)
  .pipe(fs.createWriteStream(join(process.cwd(), 'wiki.tar')))
  .on('error', console.log);
