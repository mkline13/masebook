

export default function (msg) {
    const dummy_page_controller = (req, res) => {
        res.status(200).send("DUMMY PAGE: " + msg);
    }

    return dummy_page_controller;
}