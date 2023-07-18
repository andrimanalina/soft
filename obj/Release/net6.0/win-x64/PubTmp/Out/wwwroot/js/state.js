const connection = new signalR.HubConnectionBuilder()
    .withUrl("/signalrserver")
    .withAutomaticReconnect()
    .build();
async function start() {
    try {
        await connection.start();
        console.assert(connection.state === signalR.HubConnectionState.Connected);
        console.log("Client Connected.");
    } catch (err) {
        console.assert(connection.state === signalR.HubConnectionState.Disconnected);
        console.log(err);
        setTimeout(() => start(), 5000);
    }
};

$(() => {
    start();

    connection.on("CreateState", function (code) {
        $("#state-new").before(code);

        Toast.fire({
            icon: 'info',
            title: `Liste:"${name}" à été ajouter`
        });
    });
    connection.on("DeleteState", function (id, name) {
        $(`[state-id="${id}"]`).remove();

        Toast.fire({
            icon: 'info',
            title: `Liste:"${name}" à été supprimer`
        });
    });
    connection.on("UpdateState", function (id, newname, oldname) {
        let header = $(`[state-id="${id}"]`);

        header.find("[state-name] .card-title").text(newname);

        Toast.fire({
            icon: 'info',
            title: `Mise à jour de la Liste:"${oldname}" en "${newname}"`
        });
    });

    connection.onreconnecting(error => {
        console.assert(connection.state === signalR.HubConnectionState.Reconnecting);

        document.getElementById("messageInput").disabled = true;

        const li = document.createElement("li");
        li.textContent = `Connection lost due to error "${error}". Reconnecting.`;
        document.getElementById("messageList").appendChild(li);
    });

    connection.onreconnected(connectionId => {
        console.assert(connection.state === signalR.HubConnectionState.Connected);

        document.getElementById("messageInput").disabled = false;

        const li = document.createElement("li");
        li.textContent = `Connection reestablished. Connected with connectionId "${connectionId}".`;
        document.getElementById("messageList").appendChild(li);
    });
});

let BoardId = "";

$(document).ready(() => {
    let BoardUrl = window.location.href;
    BoardId = BoardUrl.split("/").pop();


    $("#state-add").hide();

    GetState();

    new Sortable($("#sort1"), {
        group: 'card', // set both lists to same group
        animation: 150
    });

    new Sortable($("#sort2"), {
        group: 'card',
        animation: 150
    });

    new Sortable($(document).$(".sort"), {
        group: 'states', // set both lists to same group
        swap: true, swapThreshold: 1,
        swapClass: 'state',
        animation: 150,
    });

});

//#region menu
$(document).on('click', '[data-name="b-favoris"]', (e) => {
    let favoris = $(e.target).closest(`i`);
    let boardName = $(e.target).closest(`div.row`).find('[data-name="b-title"]').text();

    let isFavoris = favoris.hasClass("text-muted");
    //Goto Back
    let formData = new FormData();

    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("boardId", BoardId);
    formData.append("isFavoris", isFavoris);

    $.ajax({
        type: "POST",
        url: "../Board/UpdateFavoris",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            States = JSON.parse(result);
            if (States.type == "login") {
                window.location = "../";
                return;
            }
            if (States.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: States.msg
                });
                return;
            }

            if (isFavoris) {
                favoris.removeClass("text-muted");
                favoris.addClass("text-warning");
                Toast.fire({
                    icon: 'info',
                    title: `Vous suivez : "${boardName}"`
                });
            } else {
                favoris.removeClass("text-warning");
                favoris.addClass("text-muted");
                Toast.fire({
                    icon: 'info',
                    title: `Vous ne suivez plus : "${boardName}"`
                });
            }
            
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

//#region state
$(document).on('click', '[state-update]', (e) => {
    let header = $(e.target).closest(`div.Trello-State`);

    let sinput = header.find('[state-input]');
    let sname = header.find('[state-name]');

    sinput.show();
    sname.hide();

    sinput.click();
    sinput.focus();
});
$(document).on('focusout', '[state-input]', (e) => {
    let header = $(e.target).closest(`div.Trello-State`);

    let sinput = header.find('[state-input]');
    let sname = header.find('[state-name]');

    sinput.hide();
    sname.show();
});
$(document).on('keyup', '[state-input]', (e) => {
    let header = $(e.target).closest(`div.Trello-State`);

    let sinput = header.find('[state-input]');
    let sname = header.find('[state-name]');
    let newname = sinput.val().trim();
    if (e.keyCode == 13) {
        if (newname != "") {
            let title = sname.find(".card-title");
            let oldname = title.text();

            //Goto Back
            let formData = new FormData();
            let id = header.attr("state-id");

            formData.append("me.Mail", User.Username);
            formData.append("me.Password", User.Password);
            formData.append("stateId", id);
            formData.append("stateName", newname);

            $.ajax({
                type: "POST",
                url: "../State/Update",
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                async: true,

                success: function (result) {
                    States = JSON.parse(result);
                    if (States.type == "login") {
                        window.location = "../";
                        return;
                    }
                    if (States.type == "error") {
                        Toast.fire({
                            icon: 'error',
                            title: States.msg
                        });
                        return;
                    }

                    title.text(newname);
                    Toast.fire({
                        icon: 'success',
                        title: `Mise à jour de la Liste:"${oldname}" en "${newname}" Réussi`
                    });

                    connection.invoke("UpdateState", id, newname, oldname);
                },

                Error: function (x, e) {
                    Toast.fire({
                        icon: 'error',
                        title: e
                    });
                }
            });

        }

        sinput.val("");
        sinput.hide();
        sname.show();
    } else if (e.keyCode == 27) {
        sinput.val("");
        sinput.hide();
        sname.show();
    }
});
$(document).on('click', '[state-delete]', (e) => {
    if (!confirm("Voulez-vous vraiment supprimer la liste et ses tâches associées")) {
        return;
    }

    let header = $(e.target).closest(`div.Trello-State`);

    //Goto Back
    let formData = new FormData();
    let id = header.attr("state-id");

    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("stateId", id);

    $.ajax({
        type: "POST",
        url: "../State/Delete",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            States = JSON.parse(result);
            if (States.type == "login") {
                window.location = "../";
                return;
            }
            if (States.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: States.msg
                });
                header.remove();
                return;
            }

            header.remove();

            Toast.fire({
                icon: 'success',
                title: `Suppression Liste:"${States.data}" Réussi`
            });

            connection.invoke("DeleteState", id, States.data);
        },

        Error: function (x, e) {
            Toast.fire({
                icon: 'error',
                title: e
            });
            header.remove();
        }
    });
});
$(document).on('click', '#state-plus', (e) => {
    $("#state-plus").hide();
    $("#state-add").show();
    
});
$(document).on('click', '#state-cancel', (e) => {
    $("#state-input").val("");
    $("#state-plus").show();
    $("#state-add").hide();
});
$(document).on('keyup', '#state-input', (e) => {
    if (e.keyCode == 13) {
        $('#state-create').click();
    } else if (e.keyCode == 27) {
        $('#state-cancel').click();
    }
});
$(document).on('click', '#state-create', (e) => {
    let name = $("#state-input").val();
    $("#state-cancel").click();
    if (name.trim() == "") return;

    let count = $(".Trello-State").length + 1;
    //background-image: linear-gradient(226deg, #0c7eea, #379a11);
    let code = ``;
    code += `
                <div class="card card-row card-default sort Trello-State block-disabled" state-id="st-${count}" state-position="${count}">
                    <div class="card-header bg-info display-dropdown">
                        <h3 class="card-title">
                            ${name}
                        </h3>
                        <div class="dropdown float-right">
                            <div class="" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="fa fa-ellipsis-h p-1"></i>
                            </div>
                            <div class="dropdown-menu large-dropdown">
                                <div class="btn bg-gradient-danger btn-flat col-12" state-delete>Supprimer</div>
                            </div>
                        </div>
                    </div>
                    <div class="card-body" card-list>
                        <div class="card card-transparent" card-new>
                            <div class="card-header" card-plus>
                                <h3 class="card-title">
                                    <i class="fa fa-plus"></i> Ajouter une tâche
                                </h3>
                            </div>
                            <div card-title style="display:none">
                                <div class="card-header inputAddList">
                                    <input type="text" class="card-title form-control" placeholder="Saisissez le nom de la tâche..." />
                                </div>
                                <div class="card-body d-flex">
                                    <div class="btn btn-primary col-6 ml-1" card-add>Ajouter</div>
                                    <i class="fa fa-times col-2 cancelList" card-cancel></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    $("#state-new").before(code);

    let header = $(`[state-id="st-${count}"]`);

    //Goto Back
    let formData = new FormData();

    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("boardId", BoardId);
    formData.append("stateName", name);
    formData.append("position", count);

    $.ajax({
        type: "POST",
        url: "../State/Create",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            States = JSON.parse(result);
            if (States.type == "login") {
                window.location = "../";
                return;
            }
            if (States.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: States.msg
                });
                header.remove();
                return;
            }
                        
            header.removeClass("block-disabled");
            header.attr("state-id", States.data);

            Toast.fire({
                icon: 'success',
                title: `Ajout Liste:"${name}" Réussi`
            });

            connection.invoke("CreateState",States.data, name, count);
            //CreateState(state.Id, state.Name, state.Position)
        },

        Error: function (x, e) {
            Toast.fire({
                icon: 'error',
                title: e
            });
            header.remove();
        }
    });
});
//#endregion

//#region card
$(document).on('click', '[card-plus]', (e) => {
    let header = $(e.target).closest(`div[card-new]`);

    header.find('[card-plus]').hide();
    header.find('[card-title]').show();
});
$(document).on('click', '[card-cancel]', (e) => {
    let header = $(e.target).closest(`div[card-new]`);
    header.find('input').val('');
    header.find('[card-plus]').show();
    header.find('[card-title]').hide();
});
$(document).on('click', '[card-add]', (e) => {
    let header = $(e.target).closest(`div[card-new]`);

    let input = header.find('input');
    let value = input.val();
    input.val('');

    let cardlist = header.closest('[card-list]');
    console.log(cardlist);
    let count = cardlist.find('[soustache-id]').length;
    while (cardlist.find(`[soustache-id="st-${count}"]`).length != 0) count++;

    let code = ``;
    code += `
        <div class="card card-outline block-disabled" card-id="cr-${count}">
            <div class="card-header" data-toggle="modal">
                <h5 class="card-title">${value}</h5>
                <div class="card-tools">
                    <a href="#" class="btn btn-tool btn-link">#${count+1}</a>
                    <a href="#" class="btn btn-tool">
                        <i class="fas fa-pen"></i>
                    </a>
                </div>
            </div>
        </div>
    `;

    header.find('[card-plus]').show();
    header.find('[card-title]').hide();

    header.before(code);

    //async to back
    let card = cardlist.find(`[card-id="cr-${count}"]`);
    let stateId = header.closest('div[state-id]').attr('state-id');

    let formData = new FormData();
    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("state.Id", stateId);
    formData.append("card.Name", value);
    formData.append("card.Position", count+1);

    $.ajax({
        type: "POST",
        url: "../Card/CreateCard",
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
                card.remove();
                return;
            }

            card.removeClass("block-disabled");
            card.attr("card-id", `${Datas.data}`);


            let modal = card.find('.card-header');
            
            modal.attr("onclick", `getModal('${Datas.data}','${value}')`); 
            modal.attr("data-target", `modal-card-${Datas.data}`);

            Toast.fire({
                icon: 'success',
                title: `Ajout Tâche:"${value}" Réussi`
            });
        },

        Error: function (e) {
            Toast.fire({
                icon: 'error',
                title: "erreur : " + e
            });
            card.remove();
        }
    });
});
//#endregion card


getModal = (cardId, cardName) => {
    var modal = $(`#modal-card-${cardId}`);
    if (modal.length) return;
    
    let codes = ``;
    codes += `
        <div class="modal faded" id="modal-card-${cardId}" aria-modal="true" role="dialog" card-m-id="${cardId}">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title" id="modal_card_title">${cardName}</h4>
                        <button type="button" class="close" data-dismiss="modal" id="dismiss-modal-workspace" aria-label="Close">
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                    <div class="modal-body row">
                        <div class="col-md-9">

                            <!--date-->
                            <div card-detail-date></div>
                            <!--End date-->

                            <!--Description-->
                            <div class="form-group" card-type="description-container">
                                <label><i class="fa fa-info-circle"></i> Description</label>
                                <div class="p-3">
                                    <div class="card-description nothing" card-type="description">
                                        Ajouter une désciption plus détaillée...
                                    </div>
                                    <div class="summernote" card-textarea="description" style=display:none"></div>
                                    <div class="">
                                        <div class="btn btn-sm btn-primary" card-type="desc_save" id="testt" style="display:none">
                                            Enregistrer
                                        </div>
                                        <div class="btn btn-sm btn-default" card-type="desc_cancel" style="display:none">
                                            Annuler
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!--End Description-->


                            <!--Checklist-->
                            <div card-detail-checklist></div>
                            <!--End Checklist-->

                            <!--Comments-->
                            <div class="form-group" card-type="comment-container">
                                <label><i class="fa fa-comment-alt"></i> Commentaires</label>
                                <div data-fill="comment">
                                    <img class="comment-image"/>
                                    <div class="comment-container">
                                        <div class="comment-box">
                                            <textarea class="comment-text p-1" placeholder="Ecrivez un commentaire..."></textarea>
                                            <div class="comment-btn-menu">
                                                <hr style="margin:0" />
                                                <div class="leftnRight">
                                                    <div class="p-2">
                                                        <div class="btn bg-gradient-primary btn-flat" id="sendComments">Enregistrer</div>
                                                        <div class="btn btn-default btn-flat">Annuler</div>
                                                    </div>
                                                    <div class="">
                                                        <div class="btn"><i class="fa fa-"></i></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!--End Comments-->
                        </div>
                        <div class="col-md-3 mt-3">
                            <div class="form-group">
                                <label>Ajouter à la carte</label>
                                <!--Membres-->
                                <!--<div class="btn btn-default col-12 card-action btn-flat"><i class="fa fa-user p-1"></i> Membres</div>-->

                                <!--Etiquette-->
                                <!--<div class="btn btn-default col-12 card-action btn-flat"><i class="fa fa-tag p-1"></i> Etiquette</div>-->

                                <!--Checklist-->
                                <div class="btn btn-default col-12 card-action btn-flat" type="button" id="bloc-checklist-${cardId}" checklist-add onclick="addCheckList(this)">
                                    <i class="fa fa-square p-1"></i> Sous-Tâche
                                </div>

                                <!--Date-->
                                <div class="dropdown">
                                    <button class="btn btn-default col-12 card-action btn-flat" type="button" id="bloc-date-${cardId}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="fa fa-clock p-1"></i> Dates
                                    </button>
                                    <div class="dropdown-menu large-dropdown" aria-labelledby="bloc-date-${cardId}">
                                        <h6 class="dropdown-header">Date d'écheance</h6>
                                        <div class="dropdown-divider"></div>
                                        <form class="px-3 py-1">
                                            <label class="">Date de début :</label>
                                            <div class="input-group">
                                                <div class="input-group-prepend">
                                                    <span class="input-group-text">
                                                        <div class="custom-control custom-checkbox">
                                                            <input class="custom-control-input" type="checkbox" id="c-bdate-${cardId}" >
                                                            <label for="c-bdate-${cardId}" class="custom-control-label"></label>
                                                        </div>
                                                    </span>
                                                </div>
                                                <input type="datetime-local" class="form-control" id="input-bdate-${cardId}" disabled/>
                                            </div>

                                            <label class="">Date limite :</label>
                                            <div class="input-group">
                                                <div class="input-group-prepend">
                                                    <span class="input-group-text">
                                                        <div class="custom-control custom-checkbox">
                                                            <input class="custom-control-input" type="checkbox" id="c-ldate-${cardId}" checked>
                                                            <label for="c-ldate-${cardId}" class="custom-control-label"></label>
                                                        </div>
                                                    </span>
                                                </div>
                                                <input type="datetime-local" class="form-control" id="input-ldate-${cardId}"/>
                                            </div>
                                        </form>

                                        <div class="dropdown-divider"></div>
                                        <div class="btn bg-gradient-primary btn-flat col-12" onclick="addDate('${cardId}')">Confirmer</div>
                                        <div class="btn btn-default btn-flat col-12" onclick="removeDate('${cardId}')">Effacer</div>
                                    </div>
                                </div>

                            </div>
                            <div class="form-group">
                                <label>Action</label>
                                <div class="btn btn-default col-12 card-action btn-flat"><i class="fa fa-arrow-right p-1"></i> Deplacer</div>
                                <div class="btn bg-gradient-danger col-12 card-action btn-flat text-light" onclick="deleteCard('${cardId}')"><i class="fa fa-trash-alt p-1"></i> Supprimer</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    $("body").append(codes);
};

//#region board
function GetState() {
    let formData = new FormData();

    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("boardId", BoardId);

    $.ajax({
        type: "POST",
        url: Origin + "State/GetState",
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
                window.location = Origin + `/Workspace`;
            }
            let Boards = Datas.data;
            console.log(Boards)
            $(`[board-title]`).text(Boards.Name);
            
            switch (Boards.Visibility) {
                case 0:
                    $(`[board-visibility]`).html(`<i class="fa fa-globe"></i> <div class="d-none d-sm-inline">Public</div>`);
                    break;
                case 1:
                    $(`[board-visibility]`).html(`<i class="fa fa-lock"></i> <div class="d-none d-sm-inline">Private</div>`);
                    break;
                case 2:
                    $(`[board-visibility]`).html(`<i class="fa fa-building"></i> <div class="d-none d-sm-inline">Espace de travail</div>`);
                    break;
                default: return;
            }
            
            $(`[board-favoris]`).addClass(Boards.isFavoris ? "text-warning":"text-muted");

            let code = ``;
            //List States
            $.each(Boards.States, (k, state) => {
                code += `
                    <div class="card card-row card-default sort Trello-State" state-id="${state.Id}" state-position="${state.Position}">
                        <div class="card-header bg-info display-dropdown">
                            <input type="text" class="form-control" state-input style="display:none"/>
                            <div class="display-dropdown" state-name>
                                <h3 class="card-title">
                                    ${state.Name}
                                </h3>
                                <div class="dropdown float-right">
                                    <div class="" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="fa fa-ellipsis-h p-1"></i>
                                    </div>
                                    <div class="dropdown-menu" style="padding: 5px;cursor:pointer">
                                        <div class="dropdown-item text-warning" state-update><i class="fa fa-pen"></i> Modifier</div>
                                        <div class="dropdown-item text-danger" state-delete><i class="fa fa-trash"></i> Supprimer</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-body" card-list>`;
                //List Card
                $.each(state.Cards, (kc, card) => {
                    let status = "";
                    //if(card.)
                    code += `
                            <div class="card ${status} card-outline" card-id="${card.Id}">
                                <div class="card-header" onclick="getModal('${card.Id}','${card.Name}')" data-toggle="modal" data-target="#modal-card-${card.Id}">
                                    <h5 class="card-title">${card.Name}</h5>
                                    <div class="card-tools">
                                        <a href="#" class="btn btn-tool btn-link">#${card.Position}</a>
                                        <a href="#" class="btn btn-tool">
                                            <i class="fas fa-pen"></i>
                                        </a>
                                    </div>
                                </div>`;
                    if (card.Description || card.Date || card.Comments > 0) {
                        code += `
                                <div class="card-body">
                                    ${card.Description ? `<i class="fa fa-info-circle"></i>` : ``}
                                    ${card.Date ? `<i class="fa fa-clock"></i>` : ``}
                                    ${card.Comments > 0 ? `<i class="fa fa-comment-alt"></i> ${card.Comments}` : ``}
                                </div>`;

                    }
                    code += `
                            </div>`;

                });

                //create card
                code += `
                            <div class="card card-transparent" card-new>
                                <div class="card-header" card-plus>
                                    <h3 class="card-title">
                                        <i class="fa fa-plus"></i> Ajouter une tâche
                                    </h3>
                                </div>
                                <div card-title style="display:none">
                                    <div class="card-header inputAddList">
                                        <input type="text" class="card-title form-control" placeholder="Saisissez le nom de la tâche..." />
                                    </div>
                                    <div class="card-body d-flex">
                                        <div class="btn btn-primary col-6 ml-1" card-add>Ajouter</div>
                                        <i class="fa fa-times col-2 cancelList" card-cancel></i>
                                    </div>
                                </div>
                            </div>

                `;

                code += `
                        </div>
                    </div>
                `;

            });


            $(`#state-new`).before(code);
        },

        Error: function (x, e) {
            alert("Some error");
            //loading(false);
        }
    });
}

$(document).on('click', '[board-vstat]', (e) => {
    let vstat = $(e.target).closest(`[board-vstat]`);
    let header = vstat.closest(`.dropdown`);
    header = header.find(`[board-visibility]`);
    let value = vstat.attr("board-vstat");

    let oldvalue = header.html();

    switch (value) {
        case '0':
            header.html(`<i class="fa fa-globe"></i> <div class="d-none d-sm-inline">Public</div>`);
            break;
        case '1':
            header.html(`<i class="fa fa-lock"></i> <div class="d-none d-sm-inline">Private</div>`);
            break;
        case '2':
            header.html(`<i class="fa fa-building"></i> <div class="d-none d-sm-inline">Espace de travail</div>`);
            break;
        default: return;
    }

    //Goto Back
    let formData = new FormData();

    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("boardId", BoardId);
    formData.append("visibility", value);

    $.ajax({
        type: "POST",
        url: Origin + "Board/UpdateVisibility",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            Datas = JSON.parse(result);
            console.log(Datas)
            if (Datas.type == "login") {
                User = null;
                window.location = Origin;
            }
            if (Datas.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: Datas.msg
                });
                header.html(oldvalue);
            }

            Toast.fire({
                icon: 'success',
                title: `Changement de Visibilité`
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

$(document).on('click', '[board-title]', (e) => {
    let header = $(e.target).closest(`.row`);
    let Iinput = header.find("[board-Ititle]");
    let Ititle = header.find("[board-title]");

    let title = Ititle.text();
    Iinput.attr("placeholder", title);

    Ititle.hide();
    Iinput.show();


    Iinput.focus();
});
$(document).on('focusout', '[board-Ititle]', (e) => {
    let header = $(e.target).closest(`.row`);
    let Iinput = header.find("[board-Ititle]");
    let Ititle = header.find("[board-title]");
    Ititle.show();
    Iinput.hide();
});
$(document).on('keyup', '[board-Ititle]', (e) => {
    let header = $(e.target).closest(`.row`);
    let Iinput = header.find("[board-Ititle]");
    let Ititle = header.find("[board-title]");

    let input = Iinput.val().trim();
    let title = Ititle.text();


    if (e.keyCode == 13) {

        Iinput.val("");
        if (input != "") {

            //Goto Back
            let formData = new FormData();

            formData.append("me.Mail", User.Username);
            formData.append("me.Password", User.Password);
            formData.append("boardId", BoardId);
            formData.append("boardName", input);

            $.ajax({
                type: "POST",
                url: "../Board/UpdateName",
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                async: true,

                success: function (result) {
                    States = JSON.parse(result);
                    if (States.type == "login") {
                        window.location = "../";
                        return;
                    }
                    if (States.type == "error") {
                        Toast.fire({
                            icon: 'error',
                            title: States.msg
                        });
                        return;
                    }

                    Toast.fire({
                        icon: 'success',
                        title: `Mise à jour du nom du tableau :"${title}" en "${input}" Réussi`
                    });

                    Ititle.text(input);

                    //connection.invoke("UpdateState", id, newname, oldname);
                },

                Error: function (x, e) {
                    Toast.fire({
                        icon: 'error',
                        title: e
                    });
                }
            });

        }

        Ititle.show();
        Iinput.hide();

    } else if (e.keyCode == 27) {
        Iinput.val("");

        Ititle.show();
        Iinput.hide();
    }
});
//#endregion board