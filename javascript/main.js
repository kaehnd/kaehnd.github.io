$(document).ready(function(){
    $('.header').height($(window).height());
    $('#clock').countdown('2021/05/30').on('update.countdown', function(event) {
        let $this = $(this).html(event.strftime(''
            + '<span class="col-sm clk-component"><span class="h1 font-weight-bold">%D</span> Day%!d</span>'
            + '<span class="col-sm clk-component"><span class="h1 font-weight-bold">%H</span> Hr</span>'
            + '<span class="col-sm clk-component"><span class="h1 font-weight-bold">%M</span> Min</span>'
            + '<span class="col-sm clk-component"><span class="h1 font-weight-bold">%S</span> Sec</span>'));
    });


    let nav = $('#primary-navigation');

    let fixed = nav.offsetTop;

    nav.find('a').on('click', function () {
        var $el = $(this)
        id = $el.attr('href');
        $('html, body').animate({
            scrollTop: $(id).offset().top - 75
        }, 500);
        return false;
    });

    initForm();

    $('#searchBar').keyup( function (event) {
        if (event.keyCode === 13) {
            $(".actions li a").each(function (index) {
                if ($(this).text().includes("Next")) {
                    $(this).click();
                }
            })
        }
    });

    //https://www.google.com/maps/dir//Pioneer+Creek+Farm,+Superior+Drive,+Lomira,+WI/@43.556544,-88.391747,15z/data=!4m9!4m8!1m0!1m5!1m1!1s0x88046eac31783f23:0xa3d022140f14235c!2m2!1d-88.391747!2d43.556544!3e0
});


function initForm() {
    let record;
    let nextButton;
    let prevButton;
    let submitButton;

    $("#wizard").steps({
        headerTag: "h4",
        bodyTag: "section",
        transitionEffect: "fade",
        enableAllSteps: true,
        titleTemplate :'<span class="number">#index#</span>',
        labels: {
            current: "",
            finish: "Submit",
            next: "Next",
            previous: "Previous"
        },
        onStepChanging: async function (event, currentIndex, newIndex) {

            $(".actions li a").each(function (index) {
                if ($(this).text().includes("Next")) {
                    nextButton = $(this);
                } else if ($(this).text().includes("Previous")){
                    prevButton = $(this);
                } else if ($(this).text().includes("Submit")){
                    submitButton = $(this);
                }
            });

            if (currentIndex === 1 && newIndex === 0) {
                nextButton.show();
                submitButton.show();
            }

            if (currentIndex === 0 && newIndex === 1 ) {
                let searchString = $('#searchBar').val();
                let people = $('#peopleOptions').empty();
                let personName = $('#personName');
                let personFoundSection = $('#personFound');
                let personNotFoundSection = $('#personNotFound');

                try {
                    personFoundSection.hide();
                    record = await GoogleClient.searchInSpreadsheet(searchString);
                    if (record === undefined) {
                        personNotFoundSection.show();
                        submitButton.hide();
                        nextButton.hide()

                    } else {
                        personNotFoundSection.hide();
                        nextButton.show()

                        for (let i = 1; i <= record.NumAttendees; i ++) {
                            people.append(`<option value=\"${i}\" class="option">${i}</option>`);
                        }
                        personName.text(record.PersonName);

                        personFoundSection.show();
                    }
                } catch (e) {
                    console.log(e)
                   //Handle error getting things
                }
            }
            return true;
        },
        onFinishing: async function (event, currentIndex) {
            let num = $('#peopleOptions').children('option:selected').text()
            await record.RSVP(parseInt(num), "NOPE")
            return true;
        },
        onFinished: function (event, currentIndex) {
            $('#RSVPForm').hide();
            $('#submittedText').show();
        }
    });

    $('.steps').hide();
    $('.marker').hide();
}

// Initialize and add the map
function initMap() {
    let location = {lat: 43.556544, lng: -88.391747};
    let center = {lat: location.lat, lng: location.lng + 0.5};
    let map = new google.maps.Map(
        document.getElementById('map'), {zoom: 10, center: location});
    let marker = new google.maps.Marker({position: location, map: map});
}
