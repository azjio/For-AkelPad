// попытка отступов построчно проверяя увеличение/уменьшение
// AZJIO, 16.09.2019
// Description(1033): Calculate indent and replace with tab
// Description(1049): Вычислить отсутп и заменить табуляцией
//
// Usage:
//   Call("Scripts::Main", 1, "indent2Tab.js")
// Примечание: только что готов, тестируется временем.
var hMainWnd = AkelPad.GetMainWnd();
var pText = AkelPad.GetTextRange(0, -1);

var pattern = /^\t*([ ]+)\b/gm;
if (!pattern.test(pText)) {
	WScript.Echo('Не найдено.\n\nЛибо отступ одинаковый,\nлибо уже заменён табуляций');
	WScript.Quit();
}

// pattern = /^\t*\K([ ]*)\b/gm;
// pattern = /^\t*\([ ]+)\b/gm;
pattern = /^\t*([ ]*)\b/gm;
var ArrSpace;
var last_count = 0;
var count_space;
var diff;
var j = 0;
oNum = new Object()
while ((ArrSpace = pattern.exec(pText)) != null) {
	ArrSpace[0] = ArrSpace[0].replace(/\t+/g, '') // удаляем табуляции
	count_space = ArrSpace[0].length;
	// WScript.Echo('ArrSpace[0] = |' + ArrSpace[0] + '|'); // по числу строк
	if (count_space != last_count) {
		// WScript.Echo('ArrSpace[0] = |' + ArrSpace[0] + '|'); // по числу разниц
		diff = Math.abs(last_count - count_space);
		if (oNum[diff]) { // если ключ с именем разницы существует, то
			oNum[diff]++; // увеличиваем его
		} else {
			oNum[diff] = 1; // создаём впервые со значением 1
			j++ // подсчитываем число созданных ключей
		}
		last_count = count_space;
	}
}

// WScript.Echo('j = ' + j + '\n');

if (j == 0) {
	WScript.Echo('Не найдено.\n\nЛибо отступ одинаковый,\nлибо уже заменён табуляций');
	WScript.Quit();
}

last_count = 0;
var top = 0; // ширина шага отступа в пробелах, по наибольшему значению

// Вычисляем ключ (top на выходе), содержащий наибольшее значение (last_count на выходе)
for (var p in oNum) {
	if (oNum[p] > last_count) {
		top = p
		last_count = oNum[p]
	}
}
var TextSpace = "                                        ".substr(0, top); // берём из строки столько пробелов, сколько указано в top, то есть 1 таб равен полученной ширине пробелов

/*
var infa = ''
if (top == '1') {
	infa = 'Если "1 таб = 1 пробел", то это скорее ошибка, где-то закрался лишний пробел.'
}
*/

// var warn = AkelPad.GetArgValue("warn", "0"); // можно показать отступ и пойти по 2-м вариантам замены
var nChoice = AkelPad.MessageBox(hMainWnd, 'Автоопределение 1 таб = ' + top + ' пробел(а)\n\nЗаменить на табуляцию?\n\n1 способ - корректирует смешанные отступы\n2 способ - замена по количеству пробелов на табуляцию', "Сообщение", 32 /*MB_ICONQUESTION*/ , 0,
	1 /*IDOK*/ , "1 способ", 1 /*там где 1, та кнопка по умолчанию*/ ,
	4 /*IDRETRY*/ , "2 способ", 0,
	2 /*IDCANCEL*/ , "Отмена", 0);

if (nChoice == 2) {
	WScript.Quit();
} else if (nChoice == 4) {
	Direct_Replacement()
	// WScript.Quit();
} else if (nChoice == 1) {
	Fixed_Replacement()
	// WScript.Quit();
}

function Direct_Replacement() {
	pattern = new RegExp('^(\t*)(' + TextSpace + ')', 'm');
	do {
		pText = pText.replace(pattern, "$1\t")
	} while (pattern.test(pText)) // если всё ещё содержит, то повторно заменяем
	AkelPad.SetSel(0, -1); // выделить весь текст
	AkelPad.ReplaceSel(pText); // Заменить весь выделенный текст
}

// здесь как в предыдущем варианте дошли до определения числа пробелов на табуляцию, чтобы заменить в смешанных отступах табуляцию на вычисленный пробел, потом вернуть всё в обратно в табуляцию. Просто переход между табуляционным отступом и пробельным не возможно вычислить разницу.

function Fixed_Replacement() {
	pText2 = ''
	// pText3 = '' // тест
	last_count = 0; // сбрасываем в 0 и используем для подсчёта числа пробелов в отступе
	// pattern = /^(\t*[ ]*)/g; // если использовать [ ]+ или \b то проблема для пустых строк... уже не надо, уже "new RegExp"
	// var pattern2 = /^\t*[ ]+\b/gm; // бывший тест игнора строк с табуляцией
	var sTab = ''; // для текущего отступа из табуляций
	// var ArrString = pText.split(/\r\n|\r|\n/g); // с рег.выр. не захватывались пустые строки
	// var ArrString = pText.split('\n'); // почему то \n здесь не воспринимается как символ LF, использование \r или \r\n тоже давало проблемы
	var ArrString = pText.split(String.fromCharCode(13)); // 13 = CR = \r   10 = LF = \n
	/*
	WScript.Echo('ArrString.length = ' + ArrString.length); // просмотр правильности числа строк
	WScript.Quit();
	*/
	for (var i = 0; i <= ArrString.length - 1; i++) { // перечисление построчно
		if ((ArrString[i].length == 0) || /^[\t ]+$/.test(ArrString[i])) { // если строка пустая или содержит только пробельные символы, то
			last_count = 0;
			pText2 += '\n'; // добавляем пустую строку
			sTab = '';
			// WScript.Echo('строка = |' + ArrString[i] + '|\nНомер строки = ' + i); // просмотр пустых строк
			continue;
		}
		pattern = new RegExp("^(\t*[ ]*)", 'g'); // новый объект, чтобы без lastIndex
		ArrSpace = pattern.exec(ArrString[i]); // ищем пробелы в начале строки
		// WScript.Echo('ArrSpace[0] = |' + ArrSpace[0] + '|'); // вывод ширины
		// if ((!ArrSpace) || (ArrSpace[0].length == 0) || (!pattern2.test(ArrString[i]))) { // изначально было много ошибок
		if (!ArrSpace) { // null не должно, так как массив создан с помощью split, а рег.выр. захватывает даже если не найдено
			WScript.Echo('Ошибка захвата пробела в строке, заврешаем ничего не делая.');
			WScript.Quit(); // а можно ли? Интерпретатор вероятно всё освободит и закроет сам
			// continue;
		}
		if (ArrSpace[0].length == 0) { // если в строке нет отступов, то... добавляем строку как есть, а переменные сбрасываем в 0
			last_count = 0;
			pText2 += ArrString[i] + '\n';
			sTab = '';
			// WScript.Echo('строка = |' + ArrString[i] + '|\n пробелы = |' + ArrSpace[0] + '|\n длина = ' + ArrSpace[0].length + '\n массив = ' + !ArrSpace); // просмотр
			continue;
		}
		ArrSpace[0] = ArrSpace[0].replace(/\t/g, TextSpace); // заменяем табуляции пробелами, по ранее вычиссленной ширине
		count_space = ArrSpace[0].length; // число пробелов в отступе
		// WScript.Echo('ArrSpace[0] = |' + ArrSpace[0] + '|\n' + count_space + ' ' + last_count); // просмотр отступа
		if (count_space > last_count) { // если текущий отступ больше предыдущего, то
			// WScript.Echo('ArrSpace[0] -= |' + ArrSpace[0] + '|\n' + count_space + ' ' + last_count); // просмотр увеличения отступа
			sTab += '	'; // добавляем таб
			last_count = count_space;
		} else if (count_space < last_count) { // если текущий отступ меньше предыдущего, то... повтор условия устраняет вариант "count_space == last_count"
			// WScript.Echo('ArrSpace[0] += |' + ArrSpace[0] + '|\n' + count_space + ' ' + last_count); // просмотр уменьшенияотступа
			sTab = sTab.slice(0, -1); // отрезаем 1 таб
			last_count = count_space;
		}
		// если "count_space == last_count", то используем ширину отступа вычисленную на предыдущем шаге
		ArrString[i] = ArrString[i].replace(/^[\t ]+/g, ''); // удаляем отступы, чтобы импортировать вычисленные отступы (sTab)
		pText2 += sTab + ArrString[i] + '\n'; // добавляем с отступами

	};
	pText2 = pText2.slice(0, -1); // отрезаем последний лишний добавленный скриптом перенос

	AkelPad.SetSel(0, -1); // выделить весь текст
	AkelPad.ReplaceSel(pText2); // Заменить весь выделенный текст
}