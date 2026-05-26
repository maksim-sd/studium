export function FormatDate(date) {
    const newDate = new Date(date)
    return newDate.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
        })
}