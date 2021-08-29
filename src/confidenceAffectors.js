// function sum(...numbers) {
//     return numbers.reduce((total, num) => (
//         total + num
//     ), 0);
// }

export default {
    // marketIsOnDowntrend() {
    //     const trend = timeline.slice(0, timeSincePeak);
    //     const avgFromPeakToNow = sum(...trend)/trend.length;

    // }

    "stock is peaking": (confidence, highestPrice, lowestPrice, stock) => {
        const gap = highestPrice - lowestPrice;
        const proximityToPeak = (highestPrice - stock.price)/gap;
        console.log('prox to peak', proximityToPeak); // probably 0
        if (proximityToPeak < 0.2) {
            // a negative value will cause confidence to increase unless we use an abs value
            // in which case being hugely away from peak will cause less effect
            // which is actually kinda true
            return confidence - (1 + Math.abs(proximityToPeak));
        }
        return confidence;
    },

    "stock is falling knife": (confidence, highestPrice, lowestPrice, stock) => {
        const gap = highestPrice - lowestPrice;
        const proximityToBottom = (stock.price - lowestPrice)/gap;
        if (proximityToBottom < 0.2) {
            // the closer it is to the bottom, the more the investor will want it
            // obviously this is not how people behave, they at least want the stock
            // to turnaround before they buy, but at the moment we're just simulating
            // pure demand and supply
            return confidence + Math.abs(proximityToBottom);
        }
        return confidence;
    }
}