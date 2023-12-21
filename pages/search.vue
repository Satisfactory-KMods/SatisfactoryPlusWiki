<script lang="ts" setup>
	const { params, setParams } = useQueryParams(
		{
			search: String(),
			page: String(1)
		},
		() => {}
	);

	const { data, status, error } = useFetch('/api/search', {
		query: {
			search: params.search,
			page: params.page,
			limit: 25
		},
		watch: [
			() => {
				return params;
			}
		]
	});
</script>

<template>
	<div>
		{{ status }}
		{{ data }}
		{{ error }}
	</div>
</template>
