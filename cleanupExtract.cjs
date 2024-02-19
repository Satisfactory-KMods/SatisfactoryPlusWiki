/* eslint-disable */
const fs = require('fs/promises');
const fss = require('fs');
const { join } = require('path');
const Jimp = require('jimp');
const compressing = require('compressing');

async function cleanup() {
	for (const path of [
		'/Game/FactoryGame/-Shared',
		'/Game/FirstPerson',
		'/Game/LoadingScreen',
		'/Game/ProceduralNaturePack',
		'/Game/StarterContent',
		'/Game/watermaterials',
		'/Game/FactoryGame/Map',
		'/Game/FactoryGame/PostProcess',
		'/Game/FactoryGame/MasterMaterials',
		'/Game/FactoryGame/VFX',
		'/Game/FactoryGame/Weather',
		'/Game/FactoryGame/Interface'
	]) {
		const absPath = join(process.cwd(), 'public/sf', path);
		await fs
			.rm(absPath, { recursive: true, force: true })
			.catch(() => console.error(absPath + 'not found'));
	}
}

async function read(path) {
	const scanResult = await fs.readdir(path, { withFileTypes: true });
	for (const item of scanResult) {
		if (
			item.isFile() &&
			!item.name.toLowerCase().endsWith('.json'.toLowerCase()) &&
			(item.name.toLowerCase().endsWith('_AO.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_AOMasks.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_ORMA.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_MREA.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_MREO.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_Rough.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_Emissive.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_Mask.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_BaseColor.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_Reflection.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_BlackMask.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_NORM.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_BC.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_AlphaMap.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_BC_2.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_N_2.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_Refl_2.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_Refl.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_metallic.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_Normal.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_Roughness.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_N.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_Refl.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_BC.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_Alb.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_Nor.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_Refl.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_Albedo.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_Displacement.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_Opacity.png'.toLowerCase()))
		) {
			console.log('removing', join(path, item.name));
			await fs.unlink(join(path, item.name));
		} else if (item.isFile() && !item.name.endsWith('.json')) {
			console.log('removing', join(path, item.name));
			const img = await Jimp.read(join(path, item.name)).catch(() => null);
			if (!img) continue;
			await fs.unlink(join(path, item.name));
			if (img.bitmap.width === img.bitmap.height && img.bitmap.width <= 2048) {
				if (img.bitmap.width > 256) {
					console.log('resize', join(path, item.name));
					await img.resize(256, 256).quality(80).writeAsync(join(path, item.name));
				} else {
					console.log('quality', join(path, item.name));
					await img.quality(80).writeAsync(join(path, item.name));
				}
			} else {
				console.log('removing', join(path, item.name));
			}
		} else if (item.isDirectory()) {
			await read(join(path, item.name));
		}
	}
}

cleanup()
	.then(() => read(join(process.cwd(), 'public/sf')))
	.then(() => {
		const tarStream = new compressing.tar.Stream();

		if (fss.existsSync(join(process.cwd(), 'wiki.tar'))) {
			fss.unlinkSync(join(process.cwd(), 'wiki.tar'));
		}

		function addAllPngToStream(path) {
			const scanResult = fss.readdirSync(path, { withFileTypes: true });
			for (const item of scanResult) {
				if (item.isFile() && item.name.toLowerCase().endsWith('.png'.toLowerCase())) {
					tarStream.addEntry(join(path, item.name), {
						relativePath: join(path.replace(join(process.cwd()), ''), item.name)
							.replaceAll('\\', '/')
							.substr(1)
					});
				} else if (item.isDirectory()) {
					addAllPngToStream(join(path, item.name));
				}
			}
		}

		addAllPngToStream(join(process.cwd(), 'public/sf'));

		tarStream
			.on('error', console.log)
			.pipe(fss.createWriteStream(join(process.cwd(), 'wiki.tar')))
			.on('error', console.log);
	});
