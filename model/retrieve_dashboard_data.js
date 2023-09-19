const db = require("./db")

const dummy_dashboard_data = {
    user: {
        name: "Bob",
        spaces: ["A", "B", "C"],
        member_of: ["X", "Y", "Z"],
        new_messages: 22,
    },
    pinned: [
        {content: "Pinned Hello world!", reactions: false, discussion: false}
    ],
    feed: [
        {content: "Hello world!", reactions: false, discussion: false},
        {content: "Hello world with reactions!", reactions: true, discussion: false},
        {content: "Hello world! with discussion only", reactions: false, discussion: true}
    ],
    pokes: [
        { id: 1, poker: 'Joe', poker_id: 22 },
        { id: 2, poker: 'Jim', poker_id: 23 },
        { id: 3, poker: 'Jerry', poker_id: 24 },
        { id: 4, poker: 'John', poker_id: 25 },
    ]
}


const retrieveDashboardData = (user_id) => {
    return dummy_dashboard_data;
}

module.exports = retrieveDashboardData;