let defaultMenu = `
    <div id="menuRCard" class="menuRC" style="display: none"> 
        <ul class="menu"> 
            <li class="share"><a href="#"><i class="fa fa-share" aria-hidden="true"></i> Share</a></li> 
            <li class="rename"><a href="#"><i class="fa fa-pencil" aria-hidden="true"></i> Rename</a></li> 
            <li class="link"><a href="#"><i class="fa fa-link" aria-hidden="true"></i> Copy Link Address</a></li> 
            <li class="copy"><a href="#"><i class="fa fa-copy" aria-hidden="true"></i> Copy to</a></li> 
            <li class="paste"><a href="#"><i class="fa fa-paste" aria-hidden="true"></i> Move to</a></li> 
            <li class="download"><a href="#"><i class="fa fa-download" aria-hidden="true"></i> Download</a></li> 
            <li class="trash"><a href="#"><i class="fa fa-trash" aria-hidden="true"></i> Delete</a></li> 
        </ul> 
    </div> 
`;

let RCMCard = `
    <div id="menuRCard" class="menuRC" style="display: none" card-target=""> 
        <ul class="menu"> 
            <li><div class="text-warning" card-modify><i class="fa fa-pen" aria-hidden="true"></i> Modifier</div></li> 
            <li class="trash"><div class="text-danger" card-delete><i class="fa fa-trash" aria-hidden="true"></i> Supprimer</div></li> 
        </ul> 
    </div> 
`;

$(document).ready(() => {
    $("body").append(RCMCard);
});

$(document).on("click", (e) => {
    hideMenu();
});


function hideMenu() {
    $(".menuRC").hide();
}

