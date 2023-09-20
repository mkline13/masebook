
const dummy_dashboard_data = {
    user: {
        name: "Bob",
        spaces: ["A", "B", "C"],
        member_of: ["X", "Y", "Z"],
        new_messages: 22,
    },
    feed: [
        {author: "Jeb Beb", date: "7-30-2023", content: "Hello world!"},
        {author: "Jeb Beb", date: "7-30-2023", content: "Hello world with reactions!", reactions: true},
        {author: "Jeb Beb", date: "7-30-2023", content: "Hello world! with discussion only", discussion: true},
        {author: "Jeb Beb", date: "7-30-2023", content: "Hello world!"},
        {author: "Jeb Beb", date: "7-30-2023", content: "Hello world with reactions!", reactions: true},
        {author: "Jeb Beb", date: "7-30-2023", content: "Hello world! with discussion only", discussion: true},
        {author: "Jeb Beb", date: "7-30-2023", content: "Hello world!"},
        {author: "Jeb Beb", date: "7-30-2023", content: "Hello world with reactions!", reactions: true},
        {author: "Jeb Beb", date: "7-30-2023", content: "Hello world! with discussion only", discussion: true},
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

export default retrieveDashboardData;