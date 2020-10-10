// Key Performance Indicators

import React from 'react'
import PropTypes from 'prop-types'
import './Kpi.scss'

const Kpi = props =>
  <div className={`kpi ${props.className}`}>
    <div className="countdown__item countdown__item--days">
      <div className="countdown__value"></div>
      <div className="countdown__unit">Giorni</div>
    </div>
    <div className="countdown__item countdown__item--hours">
      <div className="countdown__value"></div>
      <div className="countdown__unit">Ore</div>
    </div>
    <div className="countdown__item countdown__item--minutes">
      <div className="countdown__value"></div>
      <div className="countdown__unit">Minuti</div>
    </div>
    <div className="countdown__item countdown__item--seconds">
      <div className="countdown__value"></div>
      <div className="countdown__unit">Secondi</div>
    </div>
  </div>

Kpi.propTypes = {
  className: PropTypes.string,
}

Kpi.defaultProps = {
  className: '',
}

export default Kpi

/*
jQuery(document).ready(function($){

// Set the date we're counting down to
var countDownDate = new Date($('.countdown').data('date')).getTime();

// Update the count down every 1 second
var x = setInterval(function() {

  // Get today's date and time
  var now = new Date().getTime();

  if (!$('.countdown').hasClass('.countdown--initialized')) {
    $('.countdown').addClass('countdown--initialized')
  }

  // Find the distance between now and the count down date
  var distance = countDownDate - now;

  // Time calculations for days, hours, minutes and seconds
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  if (days < 1) {
    ! $('.countdown').hasClass('countdown--small') ? $('.countdown').addClass('countdown--small') : '';
    $('.countdown__item--days').remove();
  } else {
    $('.countdown__item--days .countdown__value').html(days);
  }
  $('.countdown__item--hours .countdown__value').html(hours);
  $('.countdown__item--minutes .countdown__value').html(minutes);
  $('.countdown__item--seconds .countdown__value').html(seconds);

  // If the count down is over, write some text
  if (distance < 0) {
    clearInterval(x);
    $('.countdown').removeClass('countdown--initialized').text("EXPIRED");
  }
}, 1000);

});

*/
