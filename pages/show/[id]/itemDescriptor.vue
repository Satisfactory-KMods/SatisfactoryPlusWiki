<script lang="ts" setup>
	const { params } = useParams({
		id: String()
	});
	const { data: result } = await useFetch(`/api/data/${params.id}/item`);
</script>

<template>
	<div>
		{{ result }}
	</div>
</template>
