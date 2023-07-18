//const connection = new signalR.HubConnectionBuilder()
//    .withUrl("/signalrserver")
//    .withAutomaticReconnect()
//    .build();

//async function start() {
//    try {
//        await connection.start();
//        console.assert(connection.state === signalR.HubConnectionState.Connected);
//        console.log("Client Connected.");
//    } catch (err) {
//        console.assert(connection.state === signalR.HubConnectionState.Disconnected);
//        console.log(err);
//        setTimeout(() => start(), 5000);
//    }
//};

const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Decembre"];
const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

$(() => {
    //start();

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

    //connection.onreconnecting(error => {
    //    console.assert(connection.state === signalR.HubConnectionState.Reconnecting);

    //    document.getElementById("messageInput").disabled = true;

    //    const li = document.createElement("li");
    //    li.textContent = `Connection lost due to error "${error}". Reconnecting.`;
    //    document.getElementById("messageList").appendChild(li);
    //});

    //connection.onreconnected(connectionId => {
    //    console.assert(connection.state === signalR.HubConnectionState.Connected);

    //    document.getElementById("messageInput").disabled = false;

    //    const li = document.createElement("li");
    //    li.textContent = `Connection reestablished. Connected with connectionId "${connectionId}".`;
    //    document.getElementById("messageList").appendChild(li);
    //});
});

$(document).ready(() => { 

    $("#state-add").hide();


});

//#region state

//all state
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
$(document).on('click', '[state-update]', (e) => {
    let header = $(e.target).closest(`div.Trello-State`);

    let sinput = header.find('[state-input]');
    let sname = header.find('[state-name]');

    let statename = sname.find(".card-title").text().trim();

    sinput.attr("placeholder", statename);

    sinput.show();
    sname.hide();

    sinput.click();
    sinput.focus();
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


//new state
$(document).on('click', '#state-plus', (e) => {
    $("#state-plus").hide();
    $("#state-add").show();

    $("#state-input").focus();
});
$(document).on('keyup', '#state-input', (e) => {
    if (e.keyCode == 13) {
        $('#state-create').click();
    } else if (e.keyCode == 27) {
        $('#state-cancel').click();
    }
});
$(document).on('click', '#state-cancel', (e) => {
    e.stopPropagation();
    $("#state-input").val("");
    $("#state-plus").show();
    $("#state-add").hide();
});
$(document).on('focusout', '#state-new', (e) => {
    $(document).one('click', (event) => {
        if (!$(event.target).closest("#state-new").length) {
            $("#state-cancel").click();
        }
    });
});
$(document).on('click', '#state-create', (e) => {
    let name = $("#state-input").val();
    $("#state-cancel").click();
    if (name.trim() == "") return;

    let count = $(".Trello-State").length + 1;
    //background-image: linear-gradient(226deg, #0c7eea, #379a11);
    


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
                return;
            }

            let code = ``;
            code += `
                <div class="card card-row card-default sort Trello-State" state-id="${States.data}" state-position="${count}">
                    <div class="card-header bg-info display-dropdown">
                        <input type="text" class="form-control" state-input style="display:none"/>
                        <div class="display-dropdown" state-name>
                            <h3 class="card-title">${name}</h3>
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
                    <div class="card-body" card-list>
                        
                    </div>
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
            `;
            $("#state-new").before(code);

            let header = $(`[board-id]`)[0];

            //sortableOptionState(null, header);



            Toast.fire({
                icon: 'success',
                title: `Ajout Liste:"${name}" Réussi`
            });

            connection.invoke("CreateState", States.data, name, count);
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
$(document).on("click", "[card-detail]", (e) => {
    let header = $(e.target).closest("[card]");
    let cardId = header.attr("card-id");
    let cardName = header.attr("card-name");
    getModal(cardId, cardName);
});
$(document).on('click', '[card-plus]', (e) => {
    let header = $(e.target).closest(`div[card-new]`);

    header.find('[card-plus]').hide();
    header.find('[card-title]').show();

    header.find('[card-input]').focus();
});
$(document).on('click', '[card-cancel]', (e) => {
    let header = $(e.target).closest(`div[card-new]`);
    header.find('input').val('');
    header.find('[card-plus]').show();
    header.find('[card-title]').hide();
});
$(document).on('focusout', '[card-new]', (e) => {
    let header = $(e.target).closest(`div[card-new]`);
    
    $(document).one('click', (event) => {
        if ($(event.target).closest("[card-new]") != header) {
            header.find("[card-cancel]").click();
        }
    });
});

$(document).on('keyup', '[card-input]', (e) => {
    if (e.keyCode == 13) {
        let header = $(e.target).closest(`[card-new]`);
        header.find("[card-add]").click();
    } else if (e.keyCode == 27) {
        let header = $(e.target).closest(`[card-new]`);
        header.find("[card-cancel]").click();
    }
});
$(document).on('click', '[card-add]', (e) => {
    let header = $(e.target).closest(`[state-id]`);
    let cardnew = $(e.target).closest(`[card-new]`);

    let input = cardnew.find('input');
    let cardname = input.val().trim();
    if (cardname == "") {
        Toast.fire({
            icon: 'warning',
            title: "Veuillez saisir le nom de la tâche"
        });
        return;
    }
    input.val('');

    let cardlist = header.find('[card-list]');
    
    let count = cardlist.find('[card]').length + 1;

    cardnew.find('[card-plus]').show();
    cardnew.find('[card-title]').hide();


    //async to back
    let stateId = header.attr('state-id');

    let formData = new FormData();
    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("state.Id", stateId);
    formData.append("card.Name", cardname);
    formData.append("card.Position", count);

    $.ajax({
        type: "POST",
        url: Origin + "Card/CreateCard",
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


            let code = `
                <div class="card card-outline" card-id="${Datas.data}" card-name="${cardname}" card>
                    <div class="card-header" card-detail data-toggle="modal" data-target="#modal-card-${Datas.data}">
                        <h5 class="card-title">${cardname}</h5>
                        <div class="card-tools">
                            <div href="#" class="btn btn-tool btn-link">#${count}</div>

                            <div class="dropdown d-inline">
                                <div class="btn btn-tool" data-toggle="dropdown">
                                    <i class="fa fa-pen"></i>
                                </div>
                                <div class="dropdown-menu">
                                    <div class="dropdown-item btn btn-default btn-flat" card-modify>Modifier</div>
                                    <div class="dropdown-item btn btn-danger btn-flat" card-delete>Supprimer</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;


            cardlist.append(code);

            var ar = sortableOptionCard(1, cardlist[0]);
            console.log(ar);
            Toast.fire({
                icon: 'success',
                title: `Ajout Tâche:"${cardname}" Réussi`
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

//#endregion card


getModal = (cardId, cardName) => {
    var modal = $(`#modal-card-${cardId}`);
    if (modal.length) return;
    
    let codes = ``;
    codes += `
        <div class="modal faded" id="modal-card-${cardId}" aria-modal="true" role="dialog" card-m-id="${cardId}" card-modal>
            <div class="modal-dialog modal-lg  modal-dialog-scrollable">
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
                            <div class="mb-3" card-detail-date style="display:none">
                                <div class="leftnRight">
                                    <label><i class="fa fa-clock"></i> Dates</label>
                                    <div class="btn btn-default card-action btn-flat" card-date-delete>Supprimer</div>
                                </div>
                                <div class="pl-4 card-date" card-date-text>

                                </div>
                            </div>
                            <!--End date-->

                            <!--Description-->
                            <div class="form-group" card-type="description-container">
                                <label><i class="fa fa-info-circle"></i> Description</label>
                                <div class="p-3" card-description>
                                    <div class="card-description nothing" card-type="description" card-description-text>
                                        Ajouter une désciption plus détaillée...
                                    </div>
                                    <div class="summernote" card-textarea="description" style=display:none" card-description-summernote></div>
                                    <div class="">
                                        <div class="btn btn-sm btn-primary" card-type="desc_save" id="testt" style="display:none" card-description-save>
                                            Enregistrer
                                        </div>
                                        <div class="btn btn-sm btn-default" card-type="desc_cancel" style="display:none" card-description-cancel>
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
                                <div data-fill="comment" card-comments>
                                    <img class="comment-image"/>
                                    <div class="comment-container">
                                        <div class="comment-box">
                                            <textarea class="comment-text p-1" placeholder="Ecrivez un commentaire..."></textarea>
                                            <div class="comment-btn-menu">
                                                <hr style="margin:0" />
                                                <div class="leftnRight">
                                                    <div class="p-2">
                                                        <div class="btn bg-gradient-primary btn-flat" card-comments-send>Envoyer</div>
                                                        <div class="btn btn-default btn-flat" card-comments-cancel>Annuler</div>
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
                            <div class="form-group" card-menu-group>
                                <label>Ajouter à la carte</label>

                                <!--Membres-->
                                <!--<div class="btn btn-default col-12 card-action btn-flat" card><i class="fa fa-user p-1"></i> Membres</div>-->

                                <div class="dropdown">
                                    <button class="btn btn-default col-12 card-action btn-flat" type="button" id="bloc-member-${cardId}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="fa fa-user p-1"></i> Membres
                                    </button>
                                    <div class="dropdown-menu large-dropdown" aria-labelledby="bloc-member-${cardId}" card-member-menu>
                                        <h6 class="dropdown-header">Membres</h6>
                                        <div class="dropdown-divider"></div>
                                        <div class="px-3 py-1">
                                            <div class="form-group">
                                                <div class="input-group">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"><i class="fas fa-user-plus"></i></span>
                                                    </div>
                                                    <input type="text" class="form-control" card-member-add-name placeholder="Adresse e-mail">
                                                    <div class="input-group-append">
                                                        <div class="input-group-text btn bg-gradient-success" card-member-add><i class="fa fa-check text-white"></i></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <hr />
                                            <div class="form-group">
                                                <h6 class="dropdown-header">Liste des membres</h6>
                                                <ul class="list-group list-group-flush" card-member-list>
                                                    <div card-member-top-list style="display:none"></div>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!--Etiquette-->
                                <!--<div class="btn btn-default col-12 card-action btn-flat"><i class="fa fa-tag p-1"></i> Etiquette</div>-->

                                <!--Checklist-->
                                <div class="btn btn-default col-12 card-action btn-flat" type="button" id="bloc-checklist-${cardId}" card-checklist-active >
                                    <i class="fa fa-square p-1"></i> Sous-Tâche
                                </div>

                                <!--Date-->
                                <div class="dropdown">
                                    <button class="btn btn-default col-12 card-action btn-flat" type="button" id="bloc-date-${cardId}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="fa fa-clock p-1"></i> Dates
                                    </button>
                                    <div class="dropdown-menu large-dropdown" aria-labelledby="bloc-date-${cardId}" card-date-menu>
                                        <h6 class="dropdown-header">Date d'écheance</h6>
                                        <div class="dropdown-divider"></div>
                                        <form class="px-3 py-1">
                                            <label class="">Date de début :</label>
                                            <div class="input-group">
                                                <div class="input-group-prepend">
                                                    <div class="input-group-text">
                                                        <div class="custom-control custom-checkbox">
                                                            <input class="custom-control-input" type="checkbox" card-date-Cstart id="c-bdate-${cardId}" >
                                                            <label for="c-bdate-${cardId}" class="custom-control-label"></label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <input type="datetime-local" class="form-control" card-date-start disabled/>
                                            </div>

                                            <label class="">Date limite :</label>
                                            <div class="input-group">
                                                <div class="input-group-prepend">
                                                    <div class="input-group-text">
                                                        <div class="custom-control custom-checkbox">
                                                            <input class="custom-control-input" type="checkbox" card-date-Cend id="c-ldate-${cardId}" checked>
                                                            <label for="c-ldate-${cardId}" class="custom-control-label"></label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <input type="datetime-local" class="form-control" card-date-end/>
                                            </div>
                                        </form>
                                        <div class="dropdown-divider"></div>
                                        <form>
                                            <div class="btn bg-gradient-primary btn-flat col-12" card-date-add>Confirmer</div>
                                            <div class="btn btn-default btn-flat col-12" card-date-clear>Effacer</div>
                                        </form>
                                    </div>
                                </div>

                            </div>
                            <div class="form-group" card-action-group>
                                <label>Action</label>
                                <!--<div class="btn btn-default col-12 card-action btn-flat" card-move-btn><i class="fa fa-arrow-right p-1"></i> Deplacer</div>-->

                                <div  card-move-btn>
                                    <button class="btn btn-default col-12 card-action btn-flat" type="button" id="bloc-move-${cardId}" onclick="move(this)" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="fa fa-arrow-right p-1"></i> Deplacer
                                    </button>
                                    <div class="dropdown-menu large-dropdown" aria-labelledby="bloc-move-${cardId}">
                                        <h6 class="dropdown-header">Deplacer vers : </h6>
                                        <div class="dropdown-divider"></div>
                                        <div card-move-list>
                                            test
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="btn bg-gradient-danger col-12 card-action btn-flat text-light" card-delete-btn><i class="fa fa-trash-alt p-1"></i> Supprimer</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    $("body").append(codes);

    GetCardDetail(cardId);
};

function GetCardDetail(cardId) {
    //goto back
    let formData = new FormData();
    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("cardId", cardId);

    $.ajax({
        type: "POST",
        url: Origin + "Card/GetCard",
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

            let header = $(`#modal-card-${cardId}`);

            //#region description
            if (Datas.data.Description != "") {
                let description = header.find("[card-description]");
                let descr = description.find("[card-description-text]");
                descr.html(Datas.data.Description);

                isNothingDesc(Datas.data.Description, descr);
            }            
            //#endregion

            //#region Checklist
            if (Datas.data.CheckList.length) {
                header.find("[card-checklist-active]").click();

                let checklists = header.find("[card-checklist]");
                let code = ``;
                $.each(Datas.data.CheckList, (k, v) => {
                    code += `
                        <div soustache-id="st-${v.Id}">
                            <div class="leftnRight p-1">
                                <div class="custom-control custom-checkbox">
                                    <input class="custom-control-input" type="checkbox" soustache-check id="st-${v.Id}" ${v.isFinished ? `checked` : ``}>
                                    <label for="st-${v.Id}" class="custom-control-label">${v.Name}</label>
                                </div>
                                <div class="detail-pop">
                                    <div class="btn btn-sm bg-gradient-danger btn-flat" soustache-delete><i class="fa fa-trash-alt"></i></div>
                                </div>
                            </div>
                        </div>
                    `;
                });
                let chklist = checklists.find("[card-checklist-list]");
                chklist.append(code);

                ChangeProgressBar(chklist, checklists);
            }
            //#endregion


            //#region membre
            if (Datas.data.Members.length) {
                let membermenu = header.find("[card-member-menu]");
                let toplist = membermenu.find("[card-member-top-list]");
                $.each(Datas.data.Members, (k, v) => {
                    code = `
                        <li class="list-group-item d-flex justify-content-evenly" card-member-id="${v.Id}" style="padding:10px 0px;">
                            <div class="leftnRight" style="width:100%">
                                <div class="col d-flex justify-content-evenly">
                                    <div class="imgbox text-bold" card-member-abbr>${v.Abbr}</div>
                                    <div>
                                        <div card-member-name>${v.Name}</div>
                                        <div class="small" card-member-mail>${v.Mail}</div>
                                    </div>
                                </div>
                                <div class="detail-pop">
                                    <div class="text-danger btn" card-member-delete><i class="fa fa-times"></i></div>
                                </div>
                            </div>
                        </li>
                    `;
                    toplist.after(code);
                });
            }
            //#endregion

            //#region date
            if (Datas.data.StartDate != null || Datas.data.EndDate != null) {
                header.find("[card-detail-date]").show();
                let start = Datas.data.StartDate;
                let end = Datas.data.EndDate;
                let isFinished = Datas.data.isFinished;

                let dates = header.find("[card-date-menu]");
                if (start != null) {
                    let CStart = dates.find("[card-date-Cstart]");
                    let DIStart = dates.find("[card-date-start]");

                    CStart.prop("checked", "checked");
                    DIStart.removeAttr('disabled');
                    DIStart.val(start);
                }

                if (end != null) {
                    let CEnd = dates.find("[card-date-Cend]");
                    let DIEnd = dates.find("[card-date-end]");

                    CEnd.prop("checked", "checked");
                    DIEnd.removeAttr('disabled');
                    DIEnd.val(end);
                }

                InsertDate(start, end, isFinished, header);
            }
            //#endregion

            //#region Comment
            if (Datas.data.Comments.length) {
                let combox = header.find(`[card-comments]`);

                let code = ``;
                $.each(Datas.data.Comments, (k, v) => {
                    code += `
                        <div comments-id="${v.Id}">
                            <img class="comment-image"/>
                            <div class="comment-container">
                                <div class="comment-title">
                                    <div class="comment-name">${v.User.Name}</div>
                                    <div class="comment-date small">${DateLast(v.Date)}</div>
                                </div>
                                <div comments-coms>
                                    <div class="comment-box" comment-description>${v.Description}</div>
                    `;
                    if (v.User.Mail == User.Username) {
                        code += `
                                    <div class="row">
                                        <div class="btn btn-sm comment-button" comments-update>Modifier</div>
                                        <div class="btn btn-sm comment-button" comments-delete>Supprimer</div>
                                    </div>
                        `;
                    }
                    code += `
                                </div>`;
                    if (v.User.Mail == User.Username) {
                        code += `
                                <div comments-modif class="comment-box" style="display:none">
                                    <textarea class="comment-text p-1">${v.Description}</textarea>
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
                    code+=`
                            </div>
                        </div>
                    `;
                    
                });
                combox.after(code);
            }
            //#endregion
        },

        Error: function (e) {
            Toast.fire({
                icon: 'error',
                title: "erreur : " + e
            });
        }
    });
}

//#region card & RightClickMenu
$(document).on("contextmenu", "[card]", (e) => {
    e.preventDefault();
    let header = $(e.target).closest("[card]");
    $("#menuRCard").attr("card-target", header.attr("card-id"));

    var menu = $("#menuRCard");
    menu.css("display", 'block');
    menu.css("left", e.pageX + "px");
    menu.css("top", e.pageY + "px");
});

$(document).on("click", "[card-delete]", (e) => {
    if (!confirm("Voulez-vous vraiment supprimer la tâche?")) {
        return;
    }

    let cardId = $("#menuRCard").attr("card-target");

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
$(document).on("click", "[card-modify]", (e) => {
    let cardId = $("#menuRCard").attr("card-target");
    $(`[card-id="${cardId}"]`).closest("[card]").find("[card-detail]").click();
});
//#endregion


function isNothingDesc(c, descr) {
    if (c == "" || c == "<p><br></p>") {
        if (!descr.hasClass("nothing")) descr.addClass("nothing");
        descr.text(myAreaConfig.placeholder);
    } else {
        if (descr.hasClass("nothing")) descr.removeClass("nothing");
    }
}

function InsertDate(start, end, isFinished, header) {
    let code = ``;

    let test = false;
    if (start != null && start != "") {
        start = new Date(Date.parse(start));

        code += `${days[start.getDay()]} ${start.getDate()} ${months[start.getMonth()]} à ${start.getHours()}:${start.getMinutes()}`;
        test = true;
    }

    if (end != null && end != "") {
        if (test) code += " - ";
        end = new Date(Date.parse(end));

        code += `${days[end.getDay()]} ${end.getDate()} ${months[end.getMonth()]} à ${end.getHours()}:${end.getMinutes()} `;

        let now = new Date();
        let lastDay = new Date();
        lastDay.setDate(end.getDate() - 2);

        if (isFinished) {
            code += `
                            <div class="btn btn-xs bg-gradient-olive text-white" card-date-status>
                                Terminer
                            </div>
                        `;
        } else if (now >= lastDay && now <= end) {
            code += `
                            <div class="btn btn-xs bg-gradient-warning text-white" card-date-status>
                                Bientôt à échéance
                            </div>
                        `;
        } else if (end < now) {
            code += `
                            <div class="btn btn-xs bg-gradient-danger text-white" card-date-status>
                                en retard
                            </div>
                        `;
        }
    }
    header.find("[card-date-text]").html(code);
}

//#region modal
function deleteModal(cardId) {
    var modal = $(`#modal-card-${cardId}`);
    if (!modal.length) return;
    modal.modal("hide");
    modal.remove();
}
//#endregion