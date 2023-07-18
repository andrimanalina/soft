$(document).on('click', 'button ', (e) => {
    let header = $(e.target).closest(`div`);
    let caret = header.find(".caret");
    console.log(caret);
    if (caret.hasClass("fa-caret-right")) {
        caret.removeClass("fa-caret-right");
        caret.addClass("fa-caret-down");
    } else {
        caret.removeClass("fa-caret-down");
        caret.addClass("fa-caret-right");
    }
});