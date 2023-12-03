/* eslint-disable */
const fs = require('fs/promises');
const { join } = require('path');

async function cleanup(path) {
	const scanResult = await fs.readdir(path, { withFileTypes: true });
	for (const item of scanResult) {
		if (item.isFile() && item.name.toLowerCase().endsWith('.json'.toLowerCase())) {
			console.log('removing', join(path, item.name));
			await fs.unlink(join(path, item.name));
		} else if (item.isDirectory()) {
			await cleanup(join(path, item.name));
		}
	}
}

cleanup(join(process.cwd(), 'public/sf')).then(() => {});
