$('.toggle-btn').on('click', function () {
  if ($('.register-toggle').css('display') === 'none') {
    $('.login-toggle').css('display', 'none');
    $('.register-toggle').css('display', 'block');
    $('.toggle-btn')
      .html('Login Here <i class="fas fa-arrow-circle-right"></i>')
      .css('outline', 'none');
    $('.heading-toggle').html('Already Registered?');
  } else if ($('.login-toggle').css('display') === 'none') {
    $('.login-toggle').css('display', 'block');
    $('.register-toggle').css('display', 'none');
    $('.toggle-btn').html(
      'Register Here <i class="fas fa-arrow-circle-right"></i>'
    );
    $('.heading-toggle').html('Not Registered?');
  }
});

$('.forgot').on('click', function () {
  $('.forgot-password').css('display', 'block');
});

$('.send-otp').on('click', function () {
  $('.send').css('display', 'none');
  $('.validate').css('display', 'block');
});

$('.validate-otp').on('click', function () {
  $('.validate').css('display', 'none');
});

$('.close-it').on('click', function () {
  $('.forgot-password').css('display', 'none');
  $('.send').css('display', 'block');
  $('.validate').css('display', 'none');
});

$('.done').on('click', function () {
  $('.forgot-password').css('display', 'none');
  $('.send').css('display', 'block');
  $('.validate').css('display', 'none');
});
