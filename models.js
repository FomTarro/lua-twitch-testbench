class ChannelPointRedeemsList {
    /**
     * 
     * @param {string} channel_id 
     * @param {string[]} redeems 
     */
    constructor(channel_id, redeems) {
        this.data = {
            topic: `test-bench-redeem-ids.${channel_id}`,
            message: {
                redeems: redeems
            }
        }
    }
}

module.exports = ChannelPointRedeemsList;