$(document).ready(function(){
    // $('.header').height($(window).height());
    $('#clock').countdown('2021/05/30').on('update.countdown', function(event) {
        $(this).html(event.strftime(''
            + '<span class="col-sm clk-component"><span class="h1 font-weight-bold">%D</span> Day%!d</span>'
            + '<span class="col-sm clk-component"><span class="h1 font-weight-bold">%H</span> Hr</span>'
            + '<span class="col-sm clk-component"><span class="h1 font-weight-bold">%M</span> Min</span>'
            + '<span class="col-sm clk-component"><span class="h1 font-weight-bold">%S</span> Sec</span>'));
    })

    $('.work-box').fancybox();
    let nav = $('#primary-navigation, header');

    // let fixed = nav.offsetTop;

    nav.find('a').on('click', function () {
        let $el = $(this)
        let id = $el.attr('href');
        $('html, body').animate({
            scrollTop: $(id).offset().top - 75
        }, 500);
        return false;
    });

    initForm();

    $('#searchBar').keyup( function (event) {
        if (event.keyCode === 13) {
            $(".actions li a").each(function () {
                if ($(this).text().includes("Next")) {
                    $(this).click();
                }
            })
        }
    });

    $('#plusOneBtn').click(function(event){
        console.log("Called");
        $(this).text($(this).hasClass('active') ?  "Add a Plus One" : "Plus One Added");
    });
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

            $(".actions li a").each(function () {
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

                        for (let i = record.NumAttendees; i >= 0; i --) {
                            people.append(`<option value=\"${i}\" class="option">${i}</option>`);
                        }
                        personName.text(record.PersonName);

                        switch (record.PlusOneEligibility) {

                            case GoogleClient.PlusOneOptions.AccountedFor:
                                $('#accountedForDialog').show();
                                break;
                            case GoogleClient.PlusOneOptions.Reserved:
                            case GoogleClient.PlusOneOptions.Eligible:
                            case GoogleClient.PlusOneOptions.Guaranteed:
                                $('#plusOneBtn').show();
                                break;
                            default:
                                $('#plusOneBtn').hide();
                                $('#accountedForDialog').hide();
                        }
                        personFoundSection.show();
                    }
                } catch (e) {
                    console.log(e)
                   //Handle error getting things
                }
            }
            return true;
        },
        onFinishing: async function () {
            let num = $('#peopleOptions').children('option:selected').text()
            let plusOne = $('#plusOneBtn').hasClass('active');
            await record.RSVP(parseInt(num), plusOne)
            return true;
        },
        onFinished: function () {
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
