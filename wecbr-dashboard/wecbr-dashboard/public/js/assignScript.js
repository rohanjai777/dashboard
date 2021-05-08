var past = 0;

document.getElementById('addstyle').addEventListener('click', function () {
  var x = document.getElementById('group-number').value;
  var y = document.getElementById('group-link').value;
  if (x === '' || y === '') alert('Please fill the details');
  else {
    var str =
      '<tr><th scope="row">%SNO%</th><td>%GNO%</td><td id="link"><a href="#">%GLINK%</a></td><td><button id="aspbun" data-toggle="modal" data-target="#assignsp" data-whatever="@mdo" class="%CLASS%"><i class="fa fa-plus-circle" style="font-size: 12px;" aria-hidden="true"></i>Assign SP</button></td><td style="text-align: center;"><i class="fa fa-trash" aria-hidden="true" id="deleteicon"></i></td></tr>';
    var newstr = str.replace('%SNO%', past + 1);
    past++;
    newstr = newstr.replace('%GNO%', x);
    newstr = newstr.replace('%GLINK%', y);
    newstr = newstr.replace('%CLASS%', 'aspbun' + past);
    document
      .querySelector('.main-table')
      .insertAdjacentHTML('beforeend', newstr);
  }
});

var q = document.querySelectorAll('#aspbun');

for (let j = 0; j < q.length; j++) {
  var z = document.querySelectorAll('.name');
  for (let i = 0; i < z.length; i++) {
    z[i].addEventListener('click', function () {
      q[j].textContent = z[i].textContent;
      //console.log(z[i].textContent);
      q[j].style.backgroundColor = 'transparent';
      q[j].style.color = '#0099ff';
      document.querySelector('#assignsp').style.display = 'none';
    });
  }
}
