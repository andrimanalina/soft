

var myAreaConfig = {
    //airMode: true,
    maxHeight: "300px",
    placeholder: 'Ajouter une désciption plus détaillée...',
    toolbar: [
        ['misc', ['undo', 'redo']],
        ['font', ['bold', 'underline', 'clear']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link', 'picture']],
    ],
    tabDisable: true,
    disableResizeEditor: true
};
$(document).ready(function () {
    $('textarea').on('keyup keypress', function () {
        $(this).height(0);
        $(this).height(this.scrollHeight);
    });
    $('.comment-box').on('keyup keypress', function () {
        $(this).height(0);
        $(this).height(this.scrollHeight);
    });
});
$(document).ready(() => {
    /*
    //description Summernote
    $(`[card-textarea="description"]`).hide();
    $(`[card-type="desc_cancel"]`).hide();
    $(`[card-type="desc_save"]`).hide();

    //checklist Summernote
    $(`[card-textarea="checklist"]`).hide();
    */
    new Sortable($("#sort1"), {
        group: 'card', // set both lists to same group
        animation: 150
    });

    new Sortable($("#sort2"), {
        group: 'card',
        animation: 150
    });

    new Sortable(document.getElementById("state1"), {
        group: 'states', // set both lists to same group
        swap: true, swapThreshold: 1,
        swapClass: 'state',
        animation: 150,
    });

    new Sortable(document.getElementById("state2"), {
        group: 'states',
        swap: true, swapThreshold: 1,
        swapClass: 'state',
        animation: 150,
    });
});

$("#c-bdate").click(() => {
    if ($("#c-bdate").is(":checked")) $("#input-bdate").removeAttr('disabled');
    else $("#input-bdate").attr('disabled', 'disabled');
    $("#input-bdate").val("");
});
$("#c-ldate").click(() => {
    if ($("#c-ldate").is(":checked")) $("#input-ldate").removeAttr('disabled');
    else $("#input-ldate").attr('disabled', 'disabled');
    $("#input-ldate").val("");
});

//modal
//#region Modal
$('#modal-card').bind('show', function () {
    alert('Modal opened');
});
//#endregion


//description
//#region Description Parameter
$(document).on('click', `[card-type="description"]`, (e) => {
    var snote = $(e.target).closest(`div:has([card-textarea="description"])`).find(`[card-textarea="description"]`);
    let descr = $(e.target).closest(`div:has([card-type="description"])`).find(`[card-type="description"]`);
    snote.summernote(myAreaConfig);
    snote.summernote('code', descr.hasClass("nothing") ?  "" : descr.html());
    descr.hide();

    $(e.target).closest(`div:has([card-type="desc_cancel"])`).find(`[card-type="desc_cancel"]`).show();
    $(e.target).closest(`div:has([card-type="desc_save"])`).find(`[card-type="desc_save"]`).show();
});
$(document).on('click', `[card-type="desc_save"]`, (e) => {
    var header = $(e.target).closest(`div:has([card-type="description"])`);
    var sumer = header.find(`[card-textarea="description"]`);

    let code = sumer.summernote('code');

    sumer.summernote('destroy');

    var descr = header.find(`[card-type="description"]`);
    descr.html(code);
    descr.show();

    isNothingDesc(code, descr);

    header.find(`[card-type="desc_cancel"]`).hide();
    header.find(`[card-type="desc_save"]`).hide();

    sumer.hide();
});

$(document).on('click', `[card-type="desc_cancel"]`, (e) => {
    var header = $(e.target).closest(`div:has([card-type="description"])`);
    var sumer = header.find(`[card-textarea="description"]`);

    sumer.summernote('destroy');
    var descr = header.find(`[card-type="description"]`);

    descr.show();
    
    header.find(`[card-type="desc_cancel"]`).hide();
    header.find(`[card-type="desc_save"]`).hide();

    sumer.hide();
});

function isNothingDesc(c, descr) {
    if (c == "" || c == "<p><br></p>") {
        if (!descr.hasClass("nothing")) descr.addClass("nothing");
        descr.text(myAreaConfig.placeholder);
    } else {
        if (descr.hasClass("nothing")) descr.removeClass("nothing");
    }
}

//#endregion

//Checklist
//#region Checklist Parameter
$(document).on('click', `[card-type="checklist"]`, (e) => {
    var header = $(e.target).closest(`div:has([card-type="checklist-container"])`);
    var textareaBox = header.find(`[card-textarea="checklist"]`);
    textareaBox.find("textarea").val("");
    textareaBox.show();
    header.find(`[card-type="checklist"]`).hide(); 
});

addCheckList = (e) => {
    let modal = $(e).closest("div[card-m-id]");
    let cardId = modal.attr("card-m-id");
    let i = $(e).find('i');
    let checklist = modal.find(`[card-detail-checklist]`);
    if (i.hasClass("fa-square")) {
        i.removeClass("fa-square");
        i.addClass("fa-check-square");
        let code = ``;
        code += `
            <div class="form-group" card-type="checklist-container">
                <div class="leftnRight">
                    <label><i class="fa fa-check-square"></i> Sous-Tâche</label>
                    <div class="btn btn-default card-action btn-flat" checklist-delete>Supprimer</div>
                </div>
                <div class="progress progress-sm">
                    <div class="progress-bar" check-progress="" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                </div>
                <div class="p-3">
                    <div card-list="checklist">

                    </div>

                    <div class="btn btn-default card-action btn-flat mt-2" card-type="checklist">Ajouter un élément</div>
                    <div class="form-group" card-textarea="checklist" style="display:none">
                        <textarea class="form-control" rows="1" placeholder="Ajouter un élément" style="box-shadow: 1px 1px 2px #16304c40;"></textarea>
                        <div class="mt-3">
                            <div class="btn btn-sm btn-primary" checklist-type="check_add">
                                Ajouter
                            </div>
                            <div class="btn btn-sm btn-default" checklist-type="check_cancel">
                                Annuler
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        checklist.append(code);
    } else {
        if (confirm("Voulez-vous vraiment supprimer les Sous-tâches")) {
            i.removeClass("fa-check-square");
            i.addClass("fa-square");
            if (checklist.length) checklist.html("");
        }
    }
};


$(document).on('click', `[checklist-type="check_cancel"]`, (e) => {
    var header = $(e.target).closest(`div:has([card-type="checklist-container"])`);
    var textareaBox = header.find(`[card-textarea="checklist"]`);
    textareaBox.find("textarea").val("");
    textareaBox.hide();
    header.find(`[card-type="checklist"]`).show();
});
$(document).on('click', `[checklist-type="check_add"]`, (e) => {
    let cardId = $(e.target).closest(`div[card-m-id]`).attr("card-m-id");

    let header = $(e.target).closest(`div:has([card-type="checklist-container"])`);
    let textareaBox = header.find(`[card-textarea="checklist"]`);
    let textarea = textareaBox.find('textarea');
    let value = textarea.val();
    if (value.trim() == "") {
        alert("Veuillez inserer un element valable!");
        return;
    }
    let checklist = header.find(`[card-list="checklist"]`);
    let count = checklist.find('[soustache-id]').length;
    while (checklist.find(`[soustache-id="st-${count}"]`).length != 0) count++;
    let code = ``;
    code += `
        <div soustache-id="st-${count}" class="block-disabled">
            <div class="leftnRight p-1">
                <div class="custom-control custom-checkbox">
                    <input class="custom-control-input" type="checkbox" id="st-${count}" value="option1">
                    <label for="st-${count}" class="custom-control-label">${value}</label>
                </div>
                <div class="detail-pop">
                    <div class="btn btn-sm bg-gradient-danger btn-flat" soustache-delete><i class="fa fa-trash-alt"></i></div>
                </div>
            </div>
        </div>
    `;
    textarea.val("");
    textareaBox.hide();
    checklist.append(code);
    console.log($(code));
    header.find(`[card-type="checklist"]`).show();

    //async to back
    let todo = checklist.find(`[soustache-id="st-${count}"]`);

    let formData = new FormData();

    formData.append("me.Mail", "test");
    formData.append("me.Password", "123");
    formData.append("cardId", cardId);
    formData.append("todo", value);

    $.ajax({
        type: "POST",
        url: "../CheckList/Create",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            Datas = JSON.parse(result);
            if (Datas.type == "login") {
                window.location = "../";
                return;
            }
            if (Datas.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: Datas.msg
                });
                todo.remove();
                return;
            }

            todo.removeClass("block-disabled");
            todo.attr("soustache-id", `st-${Datas.data}`);
            

            Toast.fire({
                icon: 'success',
                title: `Ajout Sous-tâche:"${value}" Réussi`
            });
        },

        Error: function (e) {
            Toast.fire({
                icon: 'error',
                title: "erreur : "+e
            });
            todo.remove();
        }
    });
});


$(document).on('click', '[soustache-delete]', (e) => {
    let todo = $(e.target).closest(`div[soustache-id]`);
    todo.addClass("block-disabled");
    let id = todo.attr('soustache-id').substring(3);

    //async to back
    let formData = new FormData();

    formData.append("me.Mail", "test");
    formData.append("me.Password", "123");
    formData.append("id", id);

    $.ajax({
        type: "POST",
        url: "../CheckList/Delete",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            Datas = JSON.parse(result);
            if (Datas.type == "login") {
                window.location = "../";
                return;
            }
            if (Datas.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: Datas.msg
                });
                todo.removeClass("block-disabled");
                return;
            }

            todo.remove();

            Toast.fire({
                icon: 'success',
                title: `Suppression Sous-tâche:"${Datas.data}" Réussi`
            });
        },

        Error: function (e) {
            Toast.fire({
                icon: 'error',
                title: "erreur : " + e
            });

            todo.removeClass("block-disabled");
        }
    });
});
$(document).on('click', '[checklist-delete]', (e) => {
    if (confirm("Voulez-vous vraiment supprimer les sous-tâches?")) {
        let modal = $(e.target).closest(`div[card-m-id]`);
        let header = $(e.target).closest(`div:has([card-type="checklist-container"])`);

        let checklist = modal.find(`[card-detail-checklist]`);
        let i = modal.find(`[checklist-add]`).find('i');

        i.removeClass("fa-check-square");
        i.addClass("fa-square");
        if (checklist.length) checklist.html("");
    }
});

//#endregion

//#region Comments
$("textarea").keydown(function (e) {
    const keyCode = e.which || e.keyCode;

    // 13 represents the Enter key
    if (keyCode === 13 && !e.shiftKey) {
        e.preventDefault();
        $("#sendComments").click();
    }
});
$("#sendComments").click(() => {
    var box = $("#sendComments").closest(".comment-box");
    var textarea = box.find("textarea");
    var text = textarea.val();
    text = text.trim();
    textarea.val("");
    if (text == "") {
        return;
    }
    text = text.replace(/\n/g, "<br/>");

    textarea.css("height", "42px");
    box.css("height", "95px");

    let code = `
                <div data-comment-id="">
                    <img class="comment-image"/>
                    <div class="comment-container">
                        <div class="comment-title">
                            <div class="comment-name">Rabeloha Testa</div>
                            <div class="comment-date small">il y a 12min</div>
                        </div>
                        <div class="comment-box">
                            ${text}
                        </div>
                        <div class="row">
                            <div class="btn btn-sm comment-button">Modifier</div>
                            <div class="btn btn-sm comment-button">Supprimer</div>
                        </div>
                    </div>
                </div>
            `;
    $(`[data-fill="comment"]`).after(code);
    //sendComment(text);
});

sendComment = (text) => {
    let formData = new FormData();

    formData.append("me.Mail", "test");
    formData.append("me.Password", "123");
    formData.append("comment", text);


    $.ajax({
        type: "POST",
        url: "../Comment/SendComment",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            Datas = JSON.parse(result);
            if (Datas.type == "login") {
                window.location = "../";
                return;
            }
            if (Datas.type == "error") {
                alert(Datas.msg)
                return;
            }

            //Add CommentLine
            let code = `
                <div data-comment-id="">
                    <img class="comment-image"/>
                    <div class="comment-container">
                        <div class="comment-title">
                            <div class="comment-name">Rabeloha Testa</div>
                            <div class="comment-date small">il y a 12min</div>
                        </div>
                        <div class="comment-box">
                                    
                        </div>
                        <div class="row">
                            <div class="btn btn-sm comment-button">Modifier</div>
                            <div class="btn btn-sm comment-button">Supprimer</div>
                        </div>
                    </div>
                </div>
            `;
            $(`[data-fill="comment"]`).after(code);



        },

        Error: function (x, e) {
            alert("Some error");
            //loading(false);
        }
    });
};

//#endregion


$(`#card-confDate`).click(() => {
    //validation date
});

$(`#add-Checklist`).click(() => {
    //validation date
});

