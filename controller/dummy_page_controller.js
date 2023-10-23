

export default function (msg) {
    const dummy_page_controller = (req, res) => {
        res.send(200, "DUMMY PAGE: " + msg);
    }

    return dummy_page_controller;
}