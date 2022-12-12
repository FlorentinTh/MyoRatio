export class ChartHelper {
  static generateChartGradient(context) {
    const gradient = context.createLinearGradient(0, 25, 0, 300);

    gradient.addColorStop(0, 'rgba(22, 160, 133, 0.25)');
    gradient.addColorStop(0.35, 'rgba(22, 160, 133, 0.15)');
    gradient.addColorStop(1, 'rgba(22, 160, 133, 0)');

    return gradient;
  }
}
