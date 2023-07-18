

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


//membre
//#region membre
$(document).on('click', '[card-member-add]', (e) => {
    let header = $(e.target).closest(`[card-member-menu]`);
    let memberInput = header.find("[card-member-add-name]");
    let newmember = memberInput.val();

    let list = header.find("[card-member-list]");
    let toplist = header.find("[card-member-top-list]");

    //Goto Back
    let top = header.closest("[card-modal]");
    let cardId = top.attr("card-m-id");
    let formData = new FormData();

    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("cardId", cardId);
    formData.append("member", newmember);

    $.ajax({
        type: "POST",
        url: Origin + "Card/AddUserCard",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            Datas = JSON.parse(result);
            if (Datas.type == "login") {
                ToLogin();
            }
            if (Datas.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: Datas.msg
                });
                return;
            }

            let code = `
                <li class="list-group-item d-flex justify-content-evenly" card-member-id="${Datas.data.Id}">
                    <div class="leftnRight">
                        <div class="col d-flex justify-content-evenly">
                            <div class="imgbox text-bold" card-member-abbr>${Datas.data.Abbr}</div>
                            <div>
                                <div card-member-name>${Datas.data.Name}</div>
                                <div class="small" card-member-mail>${Datas.data.Mail}</div>
                            </div>
                        </div>
                        <div class="detail-pop">
                            <div class="text-danger btn" card-member-delete><i class="fa fa-times"></i></div>
                        </div>
                    </div>
                </li>
            `;

            toplist.after(code);

            Toast.fire({
                icon: 'success',
                title: `Ajout Membre réussi`
            });

        },

        Error: function (x, e) {
            Toast.fire({
                icon: 'error',
                title: e
            });
        }
    });

});
$(document).on('click', '[card-member-delete]', (e) => {
    if (!confirm("Voulez-vous vraiment supprimer le membre?")) return;
    let header = $(e.target).closest("[card-member-id]");
    let member = header.attr("card-member-id");

    //Goto Back
    let top = header.closest("[card-modal]");
    let cardId = top.attr("card-m-id");
    let formData = new FormData();

    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("cardId", cardId);
    formData.append("member", member);

    $.ajax({
        type: "POST",
        url: Origin + "Card/DeleteUserCard",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            Datas = JSON.parse(result);
            if (Datas.type == "login") {
                ToLogin();
            }
            if (Datas.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: Datas.msg
                });
                return;
            }

            header.remove();

            Toast.fire({
                icon: 'success',
                title: `Membre supprimer`
            });

        },

        Error: function (x, e) {
            Toast.fire({
                icon: 'error',
                title: e
            });
        }
    });
});
//#endregion

//date
//#region date
$(document).on('click', "[card-date-Cstart]", (e) => {
    let header = $(e.target).closest("[card-date-menu]");
    let isCheck = header.find("[card-date-Cstart]").prop("checked");
    let DInput = header.find("[card-date-start]");
    if (isCheck) {
        DInput.removeAttr('disabled');
    } else {
        DInput.attr('disabled','disabled');
    }
    DInput.val("");
});
$(document).on('click', "[card-date-Cend]", (e) => {
    let header = $(e.target).closest("[card-date-menu]");
    let isCheck = header.find("[card-date-Cend]").prop("checked");
    let DInput = header.find("[card-date-end]");
    if (isCheck) {
        DInput.removeAttr('disabled');
    } else {
        DInput.attr('disabled', 'disabled');
    }
    DInput.val("");
});
$(document).on('click', "[card-date-add]", (e) => {
    let header = $(e.target).closest("[card-date-menu]");
    let DIStart = header.find("[card-date-start]");
    let DIEnd = header.find("[card-date-end]");


    if (DIStart.prop("disabled") && DIEnd.prop("disabled")) {
        Toast.fire({
            icon: 'error',
            title: `Veuillez insérer une date.`
        });
        return;
    }

    if ((!DIStart.prop("disabled") && DIStart.val() == "") || (!DIEnd.prop("disabled") && DIEnd.val() == "")) {
        Toast.fire({
            icon: 'error',
            title: `Vérifier la date.`
        });
        return;
    }

    //goto back
    let top = header.closest("[card-modal]");
    let cardId = top.attr("card-m-id");
    let formData = new FormData();
    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("cardId", cardId);
    formData.append("start", DIStart.val());
    formData.append("end", DIEnd.val());


    $.ajax({
        type: "POST",
        url: Origin + "Card/UpdateDate",
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

                return;
            }

            top.find("[card-detail-date]").show();
            InsertDate(DIStart.val(), DIEnd.val(), false, top);

            Toast.fire({
                icon: 'success',
                title: `Ajout de date réussi.`
            });

        },

        Error: function (e) {
            Toast.fire({
                icon: 'error',
                title: "erreur : " + e
            });
        }
    });
});

$(document).on('click', "[card-date-clear]", (e) => {
    let header = $(e.target).closest("[card-modal]");
    header.find("[card-date-start]").val("");
    header.find("[card-date-end]").val("");
});
$(document).on('click', "[card-date-delete]", (e) => {
    if (!confirm("Voulez-vous vraiment supprimer la Date?")) return;
    let header = $(e.target).closest("[card-modal]");

    //goto back
    let cardId = header.attr("card-m-id");
    let formData = new FormData();
    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("cardId", cardId);
    formData.append("start", null);
    formData.append("end", null);


    $.ajax({
        type: "POST",
        url: Origin + "Card/UpdateDate",
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

                return;
            }


            let DIStart = header.find("[card-date-start]");
            let DIEnd = header.find("[card-date-end]");

            DIStart.val("");
            DIEnd.val("");

            header.find("[card-date-text").html("");
            header.find("[card-detail-date]").hide();


            Toast.fire({
                icon: 'success',
                title: `Date Effacer avec succes.`
            });

        },

        Error: function (e) {
            Toast.fire({
                icon: 'error',
                title: "erreur : " + e
            });
        }
    });
});

//#endregion

//modal
//#region Modal
$('#modal-card').bind('show', function () {
    alert('Modal opened');
});
//#endregion


//description
//#region Description Parameter
$(document).on('click', `[card-description-text]`, (e) => {
    let header = $(e.target).closest("[card-description]");
    var snote = header.find(`[card-description-summernote]`);
    let descr = header.find(`[card-description-text]`);
    snote.summernote(myAreaConfig);
    snote.summernote('code', descr.hasClass("nothing") ?  "" : descr.html());
    descr.hide();

    header.find(`[card-description-cancel]`).show();
    header.find(`[card-description-save]`).show();
});
$(document).on('click', `[card-description-save]`, (e) => {
    let cardId = $(e.target).closest(`[card-modal]`).attr("card-m-id");

    var header = $(e.target).closest(`[card-description]`);
    var sumer = header.find(`[card-description-summernote]`);

    let code = sumer.summernote('code');

    sumer.summernote('destroy');

    var descr = header.find(`[card-description-text]`);
    var oldtext = descr.html();

    code = code.trim();
    if (code == "<p><br></p>") code = "";

    

    //async to back
    let formData = new FormData();

    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("cardId", cardId);
    formData.append("description", code);

    $.ajax({
        type: "POST",
        url: Origin + "Description/Update",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            Datas = JSON.parse(result);
            if (Datas.type == "login") {
                ToLogin();
            }
            if (Datas.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: Datas.msg
                });
                return;
            }


            descr.html(code);
            isNothingDesc(code, descr);

            Toast.fire({
                icon: 'success',
                title: `Mise à jour de la Description Réussi`
            });

        },

        Error: function (e) {
            Toast.fire({
                icon: 'error',
                title: "erreur : " + e
            });
        }
    });



    descr.show();


    header.find(`[card-description-cancel]`).hide();
    header.find(`[card-description-save]`).hide();

    sumer.hide();

    
});

$(document).on('click', `[card-description-cancel]`, (e) => {
    var header = $(e.target).closest(`[card-description]`);
    var sumer = header.find(`[card-description-summernote]`);

    sumer.summernote('destroy');
    var descr = header.find(`[card-description-text]`);

    descr.show();
    
    header.find(`[card-description-cancel]`).hide();
    header.find(`[card-description-save]`).hide();

    sumer.hide();
});


//#endregion

//Checklist
//#region Checklist Parameter
$(document).on('click', '[card-checklist-active]', (e) => {
    let header = $(e.target).closest(`[card-menu-group]`);
    let checkInput = header.find("[card-checklist-active]");
    addCheckList(checkInput);
});

$(document).on('click', `[card-checklist-new]`, (e) => {
    let header = $(e.target).closest(`[card-checklist]`);
    let textareaBox = header.find(`[card-checklist-textarea]`);
    textareaBox.find("textarea").val("");
    textareaBox.show();
    header.find(`[card-checklist-new]`).hide(); 
});

addCheckList = (e) => {
    let modal = $(e).closest("[card-modal]");
    let cardId = modal.attr("card-m-id");
    let i = $(e).find('i');
    let checklist = modal.find(`[card-detail-checklist]`);
    if (i.hasClass("fa-square")) {
        i.removeClass("fa-square");
        i.addClass("fa-check-square");
        let code = ``;
        code += `
            <div class="form-group" card-type="checklist-container" card-checklist>
                <div class="leftnRight">
                    <label><i class="fa fa-check-square"></i> Sous-Tâche</label>
                    <div class="btn btn-default card-action btn-flat" checklist-delete>Supprimer</div>
                </div>
                <div class="progress progress-sm">
                    <div class="progress-bar" card-checklist-progressbar role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                </div>
                <div class="p-3">
                    <div card-list="checklist" card-checklist-list>

                    </div>

                    <div class="btn btn-default card-action btn-flat mt-2" card-checklist-new>Ajouter un élément</div>
                    <div class="form-group" style="display:none" card-checklist-textarea>
                        <textarea class="form-control" rows="1" placeholder="Ajouter un élément" style="box-shadow: 1px 1px 2px #16304c40;"></textarea>
                        <div class="mt-3">
                            <div class="btn btn-sm btn-primary" card-checklist-add>
                                Ajouter
                            </div>
                            <div class="btn btn-sm btn-default" card-checklist-cancel>
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


$(document).on('click', `[card-checklist-cancel]`, (e) => {
    var header = $(e.target).closest(`[card-checklist]`);
    var textareaBox = header.find(`[card-checklist-textarea]`);
    textareaBox.find("textarea").val("");
    textareaBox.hide();
    header.find(`[card-checklist-new]`).show();
});
$(document).on('click', `[card-checklist-add]`, (e) => {
    let cardId = $(e.target).closest(`[card-modal]`).attr("card-m-id");

    let header = $(e.target).closest(`[card-checklist]`);
    let textareaBox = header.find(`[card-checklist-textarea]`);
    let textarea = textareaBox.find('textarea');

    let value = textarea.val();
    if (value.trim() == "") {
        alert("Veuillez inserer un element valable!");
        return;
    }

    let checklist = header.find(`[card-checklist-list]`);
    let count = checklist.find('[soustache-id]').length + 1;

    textarea.val("");
    textareaBox.hide();

    header.find(`[card-checklist-new]`).show();

    //async to back
    let formData = new FormData();

    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("cardId", cardId);
    formData.append("todo", value);
    formData.append("pos", count);

    $.ajax({
        type: "POST",
        url: Origin + "CheckList/Create",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            Datas = JSON.parse(result);
            if (Datas.type == "login") {
                ToLogin();
            }
            if (Datas.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: Datas.msg
                });
                return;
            }

            let code = ``;
            code += `
                <div soustache-id="st-${Datas.data}">
                    <div class="leftnRight p-1">
                        <div class="custom-control custom-checkbox">
                            <input class="custom-control-input" type="checkbox" soustache-check id="st-${Datas.data}">
                            <label for="st-${Datas.data}" class="custom-control-label">${value}</label>
                        </div>
                        <div class="detail-pop">
                            <div class="btn btn-sm bg-gradient-danger btn-flat" soustache-delete><i class="fa fa-trash-alt"></i></div>
                        </div>
                    </div>
                </div>
            `;


            checklist.append(code);

            Toast.fire({
                icon: 'success',
                title: `Ajout Sous-tâche:"${value}" Réussi`
            });

            ChangeProgressBar(checklist, header);
        },

        Error: function (e) {
            Toast.fire({
                icon: 'error',
                title: "erreur : "+e
            });
        }
    });
});

function ChangeProgressBar(chklist, header) {
    let Total = chklist.find("[soustache-check]").length;
    let chkTotal = chklist.find("[soustache-check]:checked").length;

    let avg = parseFloat(chkTotal * 100 / Total).toFixed(2);
    if (avg == "NaN") avg = 0;
    let pb = header.find("[card-checklist-progressbar]");
    pb.css("width", avg + "%");
    pb.text(avg + "%");
}

$(document).on('click', '[soustache-check]', (e) => {
    let header = $(e.target).closest("[card-checklist]");
    let st = $(e.target).closest("[soustache-id]");
    let stId = st.attr("soustache-id").substring(3);;
    let value = st.find("[soustache-check").prop("checked");

    //async to back
    let formData = new FormData();

    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("checkId", stId);
    formData.append("checkVal", value);

    $.ajax({
        type: "POST",
        url: Origin + "CheckList/Update",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            Datas = JSON.parse(result);
            if (Datas.type == "login") {
                ToLogin();
            }
            if (Datas.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: Datas.msg
                });
                return;
            }

            let chklist = header.find("[card-checklist-list]");

            ChangeProgressBar(chklist, header);

            Toast.fire({
                icon: 'success',
                title: `Modification Sous-tâche:"${Datas.data}" Réussi`
            });
        },

        Error: function (e) {
            Toast.fire({
                icon: 'error',
                title: "erreur : " + e
            });
        }
    });
    
});

$(document).on('click', '[soustache-delete]', (e) => {
    let header = $(e.target).closest("[card-checklist]");
    let todo = $(e.target).closest(`[soustache-id]`);
    let id = todo.attr('soustache-id').substring(3);
    let chklist = header.find("[card-checklist-list]");

    //async to back
    let formData = new FormData();

    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("id", id);

    $.ajax({
        type: "POST",
        url: Origin + "CheckList/Delete",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            Datas = JSON.parse(result);
            if (Datas.type == "login") {
                ToLogin();
            }
            if (Datas.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: Datas.msg
                });
                return;
            }

            todo.remove();

            ChangeProgressBar(chklist, header);

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
        }
    });
});

$(document).on('click', '[checklist-delete]', (e) => {
    if (confirm("Voulez-vous vraiment supprimer les sous-tâches?")) {
        let modal = $(e.target).closest(`[card-modal]`);
        let id = modal.attr("card-m-id");
        let header = $(e.target).closest(`[card-checklist]`);

        let checklist = modal.find(`[card-detail-checklist]`);
        let i = modal.find(`[checklist-active]`).find('i');

        //async to back
        let formData = new FormData();

        formData.append("me.Mail", User.Username);
        formData.append("me.Password", User.Password);
        formData.append("id", id);

        $.ajax({
            type: "POST",
            url: Origin + "CheckList/DeleteAll",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            async: true,

            success: function (result) {
                Datas = JSON.parse(result);
                if (Datas.type == "login") {
                    ToLogin();
                }
                if (Datas.type == "error") {
                    Toast.fire({
                        icon: 'error',
                        title: Datas.msg
                    });
                    return;
                }

                i.removeClass("fa-check-square");
                i.addClass("fa-square");
                if (checklist.length) checklist.html("");

                Toast.fire({
                    icon: 'success',
                    title: `Suppression des Sous-tâches Réussi`
                });
            },

            Error: function (e) {
                Toast.fire({
                    icon: 'error',
                    title: "erreur : " + e
                });
            }
        });
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

$(document).on('click', `[card-comments-send]`, (e) => {
    let cardId = $(e.target).closest(`[card-modal]`).attr("card-m-id");

    let header = $(e.target).closest(`[card-comments]`);

    let box = header.find(".comment-box");
    let textarea = box.find("textarea");
    let text = textarea.val();
    text = text.trim();
    textarea.val("");
    if (text == "") return;

    text = text.replace(/\n/g, "<br/>");

    //textarea.css("height", "42px");
    //box.css("height", "95px");

    //async to back
    let formData = new FormData();
    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("cardId", cardId);
    formData.append("coms", text);

    $.ajax({
        type: "POST",
        url: Origin + "Comment/SendComment",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            Datas = JSON.parse(result);

            if (Datas.type == "login") {
                ToLogin();
            }
            if (Datas.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: Datas.msg
                });
                return;
            }

            let code = `
                        <div comments-id="${Datas.data.Id}">
                            <img class="comment-image"/>
                            <div class="comment-container">
                                <div class="comment-title">
                                    <div class="comment-name">${Datas.data.User.Name}</div>
                                    <div class="comment-date small">${DateLast(Datas.data.Date)}</div>
                                </div>
                                <div comments-coms>
                                    <div class="comment-box" comment-description>${Datas.data.Description}</div>
                    `;
            if (Datas.data.User.Mail == User.Username) {
                code += `
                                    <div class="row">
                                        <div class="btn btn-sm comment-button" comments-update>Modifier</div>
                                        <div class="btn btn-sm comment-button" comments-delete>Supprimer</div>
                                    </div>
                        `;
            }
            code += `
                                </div>`;
            if (Datas.data.User.Mail == User.Username) {
                code += `
                                <div comments-modif class="comment-box" style="display:none">
                                    <textarea class="comment-text p-1">${Datas.data.Description}</textarea>
                                    <div class="comment-btn-menu">
                                        <hr style="margin:0" />
                                        <div class="leftnRight">
                                            <div class="p-2">
                                                <div class="btn bg-gradient-primary btn-flat" comments-update-btn>Modifier</div>
                                                <div class="btn btn-default btn-flat" comments-cancel-btn>Annuler</div>
                                            </div>
                                            <div class="">
                                                <div class="btn"><i class="fa fa-"></i></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                        `;
            }
            code += `
                            </div>
                        </div>
            `;
            
            header.after(code);

            Toast.fire({
                icon: 'success',
                title: `Commentaire envoyé`
            });

        },

        Error: function (e) {
            Toast.fire({
                icon: 'error',
                title: "erreur : " + e
            });
        }
    });

});
$(document).on('click', `[comments-delete]`, (e) => {
    let cardId = $(e.target).closest(`[card-modal]`).attr("card-m-id");

    let com = $(e.target).closest(`[comments-id]`);
    let comsId = com.attr("comments-id");

    //async to back
    let formData = new FormData();
    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("comsId", comsId);

    $.ajax({
        type: "POST",
        url: Origin + "Comment/Delete",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            Datas = JSON.parse(result);

            if (Datas.type == "login") {
                ToLogin();
            }
            if (Datas.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: Datas.msg
                });
                return;
            }

            com.remove();

            Toast.fire({
                icon: 'success',
                title: `Commentaire Supprimer`
            });

        },

        Error: function (e) {
            Toast.fire({
                icon: 'error',
                title: "erreur : " + e
            });
        }
    });

    //sendComment(text);
});
$(document).on('click', `[comments-update]`, (e) => {
    let cardId = $(e.target).closest(`[card-modal]`).attr("card-m-id");

    let header = $(e.target).closest(`[comments-id]`);

    let modifbox = header.find("[comments-modif]");
    let comsbox = header.find("[comments-coms]");
    comsbox.hide();
    modifbox.show();
});
$(document).on('click', `[comments-cancel-btn]`, (e) => {
    let cardId = $(e.target).closest(`[card-modal]`).attr("card-m-id");

    let header = $(e.target).closest(`[comments-id]`);

    let modifbox = header.find("[comments-modif]");
    let comsbox = header.find("[comments-coms]");
    modifbox.hide();
    comsbox.show();
});
$(document).on('click', `[comments-update-btn]`, (e) => {
    let cardId = $(e.target).closest(`[card-modal]`).attr("card-m-id");

    let header = $(e.target).closest(`[comments-id]`);

    let modifbox = header.find("[comments-modif]");
    let comsbox = header.find("[comments-coms]");

    let coms = comsbox.find("[comment-description]");
    let textarea = modifbox.find("textarea");
    let text = textarea.val();
    text = text.trim();
    if (text == "") header.find("[comments-cancel-btn]`").click();

    text = text.replace(/\n/g, "<br/>");

    let comsId = header.attr("comments-id");

    //async to back
    let formData = new FormData();
    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("comsId", comsId);
    formData.append("coms", text);

    $.ajax({
        type: "POST",
        url: Origin + "Comment/update",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            Datas = JSON.parse(result);

            if (Datas.type == "login") {
                ToLogin();
            }
            if (Datas.type == "error") {
                textarea.val(coms.text());
                Toast.fire({
                    icon: 'error',
                    title: Datas.msg
                });
                return;
            }


            coms.text(text);
            modifbox.hide();
            comsbox.show();

            Toast.fire({
                icon: 'success',
                title: `Commentaire modifié`
            });

        },

        Error: function (e) {
            Toast.fire({
                icon: 'error',
                title: "erreur : " + e
            });
        }
    });
});
//#endregion


//#region Move
function move(e) {
    let cardId = $(e).closest(`[card-modal]`).attr("card-m-id");
    let cardOrigin = $(`[card-id="${cardId}"]`);
    let stateOrigin = $(cardOrigin).closest("[state-id]");
    let stateName = stateOrigin.find("[state-name] .card-title").text();
    let header = $(e).closest(`[card-action-group]`);
    let cardList = header.find("[card-move-list]");
    let stateList = $("[state-name] .card-title");
    let code = ``;
    let stateId = ``;
    $.each(stateList, (k, v) => {
        if (stateName == $(v).text()) return;
        stateId = $(v).closest("[state-id]").attr("state-id");
        code += `
            <div class="dropdown-item" card-move-state="${stateId}">${$(v).text()}</div>
        `;
    });
    cardList.html(code);
}
$(document).on('click', `[card-move-state]`, (e) => {
    let cardId = $(e.target).closest(`[card-modal]`).attr("card-m-id");
    let stateId = $(e.target).closest("[card-move-state]").attr("card-move-state");



    let card = $(`[card-id="${cardId}"]`)[0];


    let cardList = $(`[state-id="${stateId}"]`).find("[card-list]");
    let count = $(cardList).find("[card-id]").length + 1;

    let formData = new FormData();
    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("cardId", cardId);
    formData.append("cardPos", count);
    formData.append("stateId", stateId);

    $.ajax({
        type: "POST",
        url: Origin + "Card/UpdatePosition",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            Datas = JSON.parse(result);
            if (Datas.type == "login") {
                User = null;
                window.location = Origin;
            }
            if (Datas.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: Datas.msg
                });
                window.location.reload();
            }



            $(`[card-id="${cardId}"]`).remove();

            $(cardList).append(card);

            Toast.fire({
                icon: 'success',
                title: `Déplacement de la Tâche Réussi`
            });
        },

        Error: function (e) {
            Toast.fire({
                icon: 'error',
                title: "erreur : " + e
            });
            window.location.reload();
        }
    });
});
//#endregion

$(document).on("click", "[card-delete-btn]", (e) => {
    if (!confirm("Voulez-vous vraiment supprimer la tâche?")) {
        return;
    }

    let cardId = $(e.target).closest(`[card-modal]`).attr("card-m-id");

    let formData = new FormData();
    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("cardId", cardId);

    $.ajax({
        type: "POST",
        url: Origin + "Card/DeleteCard",
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
                return;
            }

            $(`[card-id="${cardId}"]`).remove();

            Toast.fire({
                icon: 'success',
                title: `La Tâche:"${Datas.data}" à été supprimer`
            });
            deleteModal(cardId);
        },

        Error: function (e) {
            Toast.fire({
                icon: 'error',
                title: "erreur : " + e
            });
        }
    });
});

$(`#card-confDate`).click(() => {
    //validation date
});

$(`#add-Checklist`).click(() => {
    //validation date
});

