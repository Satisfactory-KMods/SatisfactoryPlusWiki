/* eslint-disable */
const fs = require('fs/promises');
const { join } = require('path');
const Jimp = require('jimp');

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
		await fs.rm(absPath, { recursive: true, force: true }).catch(() => console.error(absPath + 'not found'));
	}
}

async function read(path) {
	const scanResult = await fs.readdir(path, { withFileTypes: true });
	for (const item of scanResult) {
		if (
			item.isFile() &&
			!item.name.toLowerCase().endsWith('.json'.toLowerCase()) &&
			(item.name.toLowerCase().startsWith('UI_'.toLowerCase()) ||
				item.name.toLowerCase().startsWith('T_'.toLowerCase()) ||
				item.name.toLowerCase().startsWith('MI_'.toLowerCase()) ||
				item.name.toLowerCase().startsWith('TXUI_'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_AO.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_ORMA.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_MREA.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_BaseColor.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_Reflection.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_BlackMask.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_NORM.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_BC.png'.toLowerCase()) ||
				item.name.toLowerCase().endsWith('_AlphaMap.png'.toLowerCase()) ||
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
			if (img.bitmap.width === img.bitmap.height) {
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

cleanup().then(() => read(join(process.cwd(), 'public/sf')));
