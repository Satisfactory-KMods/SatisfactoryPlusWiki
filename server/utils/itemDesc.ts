export function getItemData(id: string) {
	return db.query.items.findOne({
		where: (t, { eq }) => {
			return eq(t.shortPath, id);
		},
		with: {
			recipe: true,
			schematic: true,
			building: true
		}
	});
}
