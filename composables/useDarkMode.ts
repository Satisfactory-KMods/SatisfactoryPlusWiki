export const useDarkMode = () => {
	const colorMode = useColorMode();

	const active = computed({
		get() {
			return (colorMode.value ?? colorMode.preference) === 'dark';
		},
		set(v) {
			colorMode.value = !v ? 'light' : 'dark';
		}
	});

	const toggle = () => {
		active.value = !active.value;
	};

	const modeIcon = computed(() => {
		return active.value ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid';
	});

	return { active, modeIcon, toggle };
};
