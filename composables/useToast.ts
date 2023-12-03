import type { Notification, NotificationColor } from '@nuxt/ui/dist/runtime/types/notification';

export function useToastNotify() {
	const toast = useToast();

	function createToastNotification(notification: Partial<Omit<Notification, 'color' | 'icon'>> | string, color: NotificationColor, icon: string) {
		if (typeof notification === 'string') {
			notification = {
				title: notification
			};
		}

		return toast.add({
			...notification,
			color,
			icon
		});
	}

	function success(notification: Partial<Omit<Notification, 'color' | 'icon'>> | string) {
		return createToastNotification(notification, 'green', 'i-heroicons-check-circle');
	}

	function error(notification: Partial<Omit<Notification, 'color' | 'icon'>> | string) {
		return createToastNotification(notification, 'red', 'i-heroicons-exclamation-triangle');
	}

	function info(notification: Partial<Omit<Notification, 'color' | 'icon'>> | string) {
		return createToastNotification(notification, 'cyan', 'i-heroicons-question-mark-circle-solid');
	}

	function warning(notification: Partial<Omit<Notification, 'color' | 'icon'>> | string) {
		return createToastNotification(notification, 'yellow', 'i-heroicons-exclamation-circle');
	}

	return {
		success,
		error,
		info,
		warning,
		...toast
	};
}
