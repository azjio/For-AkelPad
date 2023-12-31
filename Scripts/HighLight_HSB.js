// AZJIO 07.10.19 - 28.03.20
// Description(1033): Highlight the selected text by adjusting the color of the mark
// Description(1049): Подсветить выделенный текст регулируя цвет метки
//
// GUI построен используя скрипт-пример CreateDialog.js от KDJ
// Требуется в папке include: CreateDialog_functions.js
/*
var sSelText = AkelPad.GetSelText()
if(sSelText == "") {
	WScript.Echo("Выделите текст");
	WScript.Quit();
}
*/


if (AkelPad.GetLangId(0 /*LANGID_FULL*/) == 0x0419) //Russian
{

  var sLng1 = "Нужно выделить текст!\nИспользовать регулярное выражения из буфера обмена?";
  var sLng2 = "Изменять фон (иначе текст)"
  var sLng3 = "Применить"
  var sLng4 = "Сброс"
  var sLng5 = "Тон"
  var sLng6 = "Насыщенность"
  var sLng7 = "Яркость"
  var sLng8 = "Регулировка цвета"
}
// else if (AkelPad.GetLangId(0 /*LANGID_FULL*/) == 0x0415) //Polish
// {
//   var sLng1       = "";
//   var sLng2  = "";
// }
else
{
  var sLng1 = "Need to select text!\nUse regular expressions from clipboard?";
  var sLng2 = "Change the background, otherwise the text"
  var sLng3 = "Apply"
  var sLng4 = "Reset"
  var sLng5 = "Tone"
  var sLng6 = "Saturation"
  var sLng7 = "Brightness"
  var sLng8 = "Color adjustment"
}




var sSelText = AkelPad.GetSelText()
if(sSelText == "") {
	var hMainWnd = AkelPad.GetMainWnd();
	// var nChoice = AkelPad.MessageBox(hMainWnd, sLng1, "Сообщение", 32 /*MB_ICONQUESTION*/ , 0,
		// 1 /*IDOK*/ , "&Да", 0,
		// 2 /*IDCANCEL*/ , "&Отмена", 0x1 /*BMB_DEFAULT*/ );
	// if(nChoice == 1) {
	if(AkelPad.MessageBox(hMainWnd, sLng1, WScript.ScriptName, 4+256+32) == 6) {
		sSelText = AkelPad.GetClipboardText();
	}
	else {
		WScript.Quit();
	}
}

var oSys = AkelPad.SystemFunction();
var sClass = "AkelPad::Scripts::" + WScript.ScriptName + "::" + AkelPad.GetInstanceDll(); // придумываем имя класса окна
var hDlg = oSys.Call("User32::FindWindowW", sClass, 0); // Ищем это окно, FindWindowW возвращает дескриптор
var sAkelDir = AkelPad.GetAkelDir();

var arr_hsb = [0, 100, 100]; // создаёт и задаёт начальную позицию
var arr_rgb = [0, 0, 0];
var bChecSt = 1;
var sBgColor = "ff0000";
var sFgColor = "ddff00";
// var ID_Color = 1;
var ID_Color = GetNewMarkID(100);
// var kk1 = 0;
// var kk2 = 0;

// AkelPad.Call("Coder::HighLight", 3, -2);

if(hDlg) // Если окно с указанным классом найдено, то
{
	if(!oSys.Call("User32::IsWindowVisible", hDlg)) // если окно невидимое, то
		oSys.Call("User32::ShowWindow", hDlg, 8 /*SW_SHOWNA*/ ); // делаем видимым
	if(oSys.Call("User32::IsIconic", hDlg)) // если окно свёрнуто, то
		oSys.Call("User32::ShowWindow", hDlg, 9 /*SW_RESTORE*/ ); // разворачиваем

	oSys.Call("User32::SetForegroundWindow", hDlg); // делаем окно активным
}
else if(AkelPad.Include("CreateDialog_functions.js")) // иначе (если окно не найдено) если существует необходимый скрипт, то
{
	var hIcon = oSys.Call("User32::LoadImageW", AkelPad.GetInstanceDll(), 101, 1 /*uType=IMAGE_ICON*/ , 0, 0, 0x40 /*LR_DEFAULTSIZE*/ ); // загружает иконку, возвращая дескриптор
	// var hImage = 0;
	// var hWndOutput = GetOutputWindow(); // получить дескриптор окна консоли
	var hDC;
	var MemDC;
	var MemBM;
	var hOldBMP;
	var fMemDC = 1;
	// Константы ID элементов управления окна
	// var ID_GROUPE = 2001; // линия группирования элементов
	var ID_CHECKB = 2002; // идентификатор чекбокса
	var ID_INP = 2003; // поле ввода
	var ID_BTN_OK = 2004; // кнопка ОК
	var ID_CANCEL = 2005; // кнопка отмена
	var ID_LBID = 2006; // Надпись над полем ввода
	var ID_TB1 = 2007;
	var ID_TB2 = 2008;
	var ID_TB3 = 2009;
	var ID_LBTB1 = 2010;
	var ID_LBTB2 = 2011;
	var ID_LBTB3 = 2012;
	var ID_LBTB4 = 2013;
	var ID_LBTB5 = 2014;
	var ID_LBTB6 = 2015;
	var ID_INPID = 2016;
	// var ID_LBColor = 2017;
	// var ID_SPEKTR = 2018;

	if(AkelPad.WindowRegisterClass(sClass)) // если класс зарегистрирован
	{
		// Разрешить запуск других скриптов
		AkelPad.ScriptNoMutex();

		CreateDialog(false, false, AkelPad.GetMainWnd()); // Функция создания окна
		AkelPad.WindowUnregisterClass(sClass); // разрегистрировать класс после закрытия окна, то есть по завершении предыдущей функции
	}

	oSys.Call("user32::DestroyIcon", hIcon); // Удалить дескриптор значка, освободив ресурсы
	// oSys.Call("User32::DestroyIcon", hImage);
	// oSys.Call("user32::ReleaseDC", aDlg.HWND, hDC);
}

function CreateDialog(bBox, bModeless, hParent) {
	var aDlg = [];
	var nResult;
	var hFocus;

	aDlg.Modeless = bModeless;
	aDlg.Title = sLng8 /* Color adjustment */ ; // Заголовок окна
	aDlg.Style = WS_VISIBLE | WS_POPUP | WS_CAPTION | WS_SYSMENU | WS_MINIMIZEBOX | WS_MAXIMIZEBOX; // Стиль окна
	aDlg.Parent = hParent; // Родитель окна (блокировать доступ к родителю или закрывать при закрытии родителя)
	aDlg.Callback = DialogCallback; // Имя функции обратного вызова принимающая события окна
	aDlg.Icon = hIcon; // дескриптор иконки окна ранее полученный
	aDlg.X = 20; // X-координата окна
	aDlg.W = 420; // ширина окна
	aDlg.H = 240; // высота окна
	aDlg.PosPar = 3;
	aDlg.CtlFirst = ID_CHECKB; // первый элемент управления
	aDlg.CtlStyle = WS_VISIBLE;

	// если флаг бокс-окно
	aDlg.PosPix = true;
	aDlg.CtlFontN = "MS Shell Dlg";

	// Масив элементов управления окна
	// Задаёт характеристики каждого (положение и размеры, текст, стиль), чтобы потом создать функцией InitDialog()
	/*
	aDlg[ID_GROUPE] = {
		X: 10,
		Y: 10,
		W: 150,
		H: 95,
		Title: "",
		Style: BS_GROUPBOX | BS_CENTER
	};
	*/
	aDlg[ID_LBID] = {
		X: 20,
		Y: 30,
		W: 20,
		H: 13,
		Title: "ID:",
		Class: "STATIC"
	};
	aDlg[ID_INPID] = {
		X: 40,
		Y: 27,
		W: 40,
		H: 20,
		Title: ""+ID_Color,
		Class: "EDIT",
		Style: WS_TABSTOP | WS_BORDER
	};
	aDlg[ID_INP] = {
		X: 333,
		Y: 63,
		W: 80,
		H: 20,
		Title: "",
		Class: "EDIT",
		Style: WS_TABSTOP | WS_BORDER
	};
	aDlg[ID_CHECKB] = {
		X: 20,
		Y: 80,
		W: 190,
		H: 16,
		Title: sLng2 /* Change the background */ ,
		Style: WS_TABSTOP | BS_AUTOCHECKBOX
	};
	aDlg[ID_BTN_OK] = {
		X: 333,
		Y: 90,
		W: 80,
		H: 23,
		Title: sLng3 /* Apply */ ,
		Style: WS_TABSTOP | BS_PUSHBUTTON
	};
	aDlg[ID_CANCEL] = {
		X: 270,
		Y: 90,
		W: 60,
		H: 23,
		Title: sLng4 /* Reset */ ,
		Style: WS_TABSTOP | BS_PUSHBUTTON
	};

	aDlg[ID_TB1] = {
		X: 5,
		Y: 140,
		W: 282,
		H: 30,
		Class: "msctls_trackbar32",
		Style: WS_TABSTOP | TBS_AUTOTICKS
	};

	aDlg[ID_TB2] = {
		X: 5,
		Y: 170,
		W: 282,
		H: 30,
		Class: "msctls_trackbar32",
		Style: WS_TABSTOP | TBS_AUTOTICKS
	};

	aDlg[ID_TB3] = {
		X: 5,
		Y: 200,
		W: 282,
		H: 30,
		Class: "msctls_trackbar32",
		Style: WS_TABSTOP | TBS_AUTOTICKS
	};
	aDlg[ID_LBTB1] = {
		X: 293,
		Y: 140,
		W: 20,
		H: 13,
		Title: "0",
		Class: "STATIC"
	};
	aDlg[ID_LBTB2] = {
		X: 293,
		Y: 170,
		W: 20,
		H: 13,
		Title: "0",
		Class: "STATIC"
	};
	aDlg[ID_LBTB3] = {
		X: 293,
		Y: 200,
		W: 20,
		H: 13,
		Title: "0",
		Class: "STATIC"
	};
	aDlg[ID_LBTB4] = {
		X: 330,
		Y: 140,
		W: 80,
		H: 13,
		Title: sLng5 /* Tone */ ,
		Class: "STATIC"
	};
	aDlg[ID_LBTB5] = {
		X: 330,
		Y: 170,
		W: 80,
		H: 13,
		Title: sLng6 /* Saturation */ ,
		Class: "STATIC"
	};
	aDlg[ID_LBTB6] = {
		X: 330,
		Y: 200,
		W: 80,
		H: 13,
		Title: sLng7 /* Brightness */ ,
		Class: "STATIC"
	};
	/*
	aDlg[ID_LBColor] = {
		X: 393,
		Y: 40,
		W: 80,
		H: 40,
		Title: "",
		Class: "STATIC",
		Style: BS_OWNERDRAW
	};
	aDlg[ID_SPEKTR] = {
		X: 16,
		Y: 134,
		W: 1,
		H: 1,
		Title: "|     |",
		Style: SS_BITMAP,
		Class: "STATIC"
	};
	*/

	// если флаг бокс-окно
	nResult = CreateDialogBox(aDlg);

	// Функция обратного вызова принимающая события
	function DialogCallback(hWnd, uMsg, wParam, lParam) {
		if(uMsg == 1 /*WM_CREATE*/ ) // если пришло сообщение о создании окна
		{
			aDlg.HWND = hWnd; // Дописываем дексриптор
			CreateDialogWindow(aDlg, 2, hWnd);
			InitDialog(); // Задаёт начальное состояние элементов в окне
			hFocus = aDlg[ID_CHECKB].HWND; // Указываем дескриптор в фокусе

			// не получается покрасить лейбл
			// hDC=AkelPad.MemRead(_PtrAdd(lParam, _X64?32:24) /*offsetof(DRAWITEMSTRUCT, hDC)*/, 2 /*DT_QWORD*/);
			// oSys.Call("gdi32::SetBkColor", hDC, 0xFFFFFF);
		}

		switch(uMsg) { // сравнение ==
			// case 0x0138 : //WM_CTLCOLORSTATIC
    // if (lParam == aDlg[ID_LBColor].HWND)
    // {
				// WScript.Echo("HWND =" + wParam + "  " + lParam); //  проходит
      /*
      oSys.Call("Gdi32::DeleteObject", hBrushColor);
      oSys.Call("Gdi32::SetTextColor", wParam, 0x006000);
      */
      // oSys.Call("Gdi32::SetBkColor", wParam, 0xFFFFFF);
      /*
      hBrushColor = oSys.Call("Gdi32::CreateSolidBrush", 0xFFFFFF);
      return hBrushColor;
      */
    // }
				// break;
			// case 78 /*WM_NOTIFY*/ :
				// var nLowParam = LoWord(wParam); // младшее слово содержит ID элемента управления
				// var nHiwParam = HiWord(wParam); // младшее слово содержит ID элемента управления
				// switch(lParam) { // если дексриптор равен
				// switch(AkelPad.MemRead(lParam + (_X64 ? 16 : 8), 3 /*DT_DWORD*/)) { // если дексриптор равен
				// }
				// break;
			case 272 /*WM_INITDIALOG*/ :
				InitDialog(); // Задаёт начальное состояние элементов в окне
				break;
			// case 561 /*WM_ENTERSIZEMOVE*/ :
				// хотел сделать копирование Bitmap от DrawLBColor в начале перемещения,
				// но не понятно как поведёт себя если начало перемещения будет частично за экраном
				// break;
			case 15: //WM_PAINT - перерисовать объекты требующие перерисовки (при запуске и за экран)
				DrawLBColor(aDlg, "" + hex(arr_rgb[0]) + hex(arr_rgb[1]) + hex(arr_rgb[2]));
				
				if (fMemDC) { // если первый вызов, то рисуем спектр и копируем в память
					Draw_SPEKTR();
					MemBM = oSys.Call("Gdi32::CreateCompatibleBitmap", hDC, 280, 140); // создаём совместимый Bitmap
					hOldBMP = oSys.Call("Gdi32::SelectObject", MemDC, MemBM); // выбираем Bitmap
					oSys.Call("Gdi32::BitBlt", MemDC, 17, 134, 260, 4, hDC, 17, 134, 0x00CC0020 /* SRCCOPY */ ); // копировать данные Bitmap из hDC в MemDC
					oSys.Call("Gdi32::DeleteObject", MemBM); // больше шаблон Bitmap не нужен
					fMemDC = 0;
				} else { // иначе возвращаем из памяти
					oSys.Call("Gdi32::BitBlt", hDC, 17, 134, 260, 4, MemDC, 17, 134, 0x00CC0020 /* SRCCOPY */ ); // копировать Bitmap из MemDC в hDC
				}
		
				
				// oSys.Call("User32::SetWindowTextW", hWnd, "Заменяем текст в заголовке окна"); // Заменяем текст в заголовке окна
				// kk1++
				// oSys.Call("User32::SetDlgItemTextW", hWnd, ID_LBTB5, "PAINT=" + kk1); // подситываем колич. срабатываний
				// oSys.Call("User32::SetDlgItemTextW", hWnd, ID_LBTB5, "=" + wParam); // подситываем колич. срабатываний
				// WScript.Echo("HWND =" + wParam + "  " + lParam); //  проходит
				break;
			case 276 /*WM_HSCROLL */ : // уведомление прокрутки
				var nLowParam = LoWord(wParam); // младшее слово содержит ID элемента управления
				var nHiwParam = HiWord(wParam); // младшее слово содержит ID элемента управления
				// WScript.Echo("HWND =" + aDlg[ID_TB1].HWND + "  " + lParam); //  проходит
				switch(lParam) { // если дексриптор равен
					case aDlg[ID_TB1].HWND: // декскриптору слайдера

						switch(nLowParam) { // уведомление
							case 0: // SB_LINELEFT - клавишами, влево, аналогично для ниже следующих
							case 1: // SB_LINERIGHT
							case 2: // SB_PAGELEFT
							case 3: // SB_PAGERIGHT
								arr_hsb[0] = AkelPad.SendMessage(aDlg[ID_TB1].HWND, 1024 /*TBM_GETPOS*/ , 0, 0); // чтение позиции со слайдера
								SetColor(hWnd, aDlg)
								oSys.Call("User32::SetDlgItemTextW", hWnd, ID_LBTB1, "" + arr_hsb[0]);
								break;
							case 4: // SB_THUMBPOSITION - колесом мыши
							case 5: // SB_THUMBTRACK - стрелкой мыши
								// WScript.Echo("nHiwParam = " + nHiwParam); // проходит
								arr_hsb[0] = nHiwParam;
								// WScript.Echo("arr_rgb[0] = " + arr_rgb[0]); // проходит
								SetColor(hWnd, aDlg)
								oSys.Call("User32::SetDlgItemTextW", hWnd, ID_LBTB1, "" + arr_hsb[0]);
								break;
						}
						break;
					case aDlg[ID_TB2].HWND: // декскриптору слайдера

						switch(nLowParam) { // уведомление
							case 0: // SB_LINELEFT - клавишами, влево, аналогично для ниже следующих
							case 1: // SB_LINERIGHT
							case 2: // SB_PAGELEFT
							case 3: // SB_PAGERIGHT
								arr_hsb[1] = AkelPad.SendMessage(aDlg[ID_TB2].HWND, 1024 /*TBM_GETPOS*/ , 0, 0); // чтение позиции со слайдера
								SetColor(hWnd, aDlg)
								oSys.Call("User32::SetDlgItemTextW", hWnd, ID_LBTB2, "" + arr_hsb[1]);
								break;
							case 4: // SB_THUMBPOSITION - колесом мыши
							case 5: // SB_THUMBTRACK - стрелкой мыши
								// WScript.Echo("nHiwParam = " + nHiwParam); // проходит
								arr_hsb[1] = nHiwParam;
								SetColor(hWnd, aDlg)
								oSys.Call("User32::SetDlgItemTextW", hWnd, ID_LBTB2, "" + arr_hsb[1]);
								break;
						}
						break;
					case aDlg[ID_TB3].HWND: // декскриптору слайдера

						switch(nLowParam) { // уведомление
							case 0: // SB_LINELEFT - клавишами, влево, аналогично для ниже следующих
							case 1: // SB_LINERIGHT
							case 2: // SB_PAGELEFT
							case 3: // SB_PAGERIGHT
								arr_hsb[2] = AkelPad.SendMessage(aDlg[ID_TB3].HWND, 1024 /*TBM_GETPOS*/ , 0, 0); // чтение позиции со слайдера
								SetColor(hWnd, aDlg)
								oSys.Call("User32::SetDlgItemTextW", hWnd, ID_LBTB3, "" + arr_hsb[2]);
								break;
							case 4: // SB_THUMBPOSITION - колесом мыши
							case 5: // SB_THUMBTRACK - стрелкой мыши
								// WScript.Echo("nHiwParam = " + nHiwParam); // проходит
								arr_hsb[2] = nHiwParam;
								SetColor(hWnd, aDlg)
								oSys.Call("User32::SetDlgItemTextW", hWnd, ID_LBTB3, "" + arr_hsb[2]);
								break;
						}
						break;
				}
				break;
			case 273 /*WM_COMMAND*/ :
				var nLowParam = LoWord(wParam); // младшее слово содержит ID элемента управления
				var nHiwParam = HiWord(wParam); // старшее слово = код действия с кнопкой (NotifyCode)
				switch(nLowParam) { // в switch сравнение ==
					case ID_INPID: // декскриптору поля ввода ID
						switch(nHiwParam) { // уведомление
							case 0x300: // EN_CHANGE - изменение в поле ввода

								// Блок для чтения из поля ввода
								var nEditLen = 32767; // число символов с запасом для поля ввода
								var lpEdit = AkelPad.MemAlloc((nEditLen + 1) * 2); // Выделяем память и получаем указатель
								oSys.Call("User32::GetDlgItemTextW", hWnd, ID_INPID, lpEdit, nEditLen); // Высылает текст поля ввода в указатель
								var sText_input = AkelPad.MemRead(lpEdit, 1 /*DT_UNICODE*/ ); // Читаем с указателя
								AkelPad.MemFree(lpEdit); // Освобождаем память
								
								if (/\D/.test(sText_input)) // если введены не цифры, то
								{
								  sText_input = sText_input.replace(/\D+/g, ''); // удаляем всё кроме цифр
								  oSys.Call("User32::SetDlgItemTextW", hWnd, ID_INPID, sText_input); // заменяем
								}
								ID_Color = parseInt(sText_input)
								// ID_Color = Math.abs(parseInt(sText_input))

								break;
						}
						break;
					case ID_CHECKB: // кнопка отмены вызылает окну команду закрытия
						bChecSt = AkelPad.SendMessage(aDlg[ID_CHECKB].HWND, 240 /*BM_GETCHECK*/ , 0, 0) // получаем состояние чекбокса
						if(bChecSt) {
							oSys.Call("User32::SetDlgItemTextW", hWnd, ID_INP, sBgColor);
						}
						else {
							oSys.Call("User32::SetDlgItemTextW", hWnd, ID_INP, sFgColor);
						}
						// break;
					case ID_BTN_OK: // событие нажатия "ОК", стандартно считываем параметры, чтобы использовать в дальнейшем
						// if (nHiwParam == 0)

						// Блок для чтения из поля ввода
						var nEditLen = 32767; // число символов с запасом для поля ввода
						var lpEdit = AkelPad.MemAlloc((nEditLen + 1) * 2); // Выделяем память и получаем указатель
						oSys.Call("User32::GetDlgItemTextW", hWnd, ID_INP, lpEdit, nEditLen); // Высылает текст поля ввода в указатель
						var sText_input = AkelPad.MemRead(lpEdit, 1 /*DT_UNICODE*/ ); // Читаем с указателя
						AkelPad.MemFree(lpEdit); // Освобождаем память

						// var CheckboxState = AkelPad.SendMessage(aDlg[ID_CHECKB].HWND, 240 /*BM_GETCHECK*/ , 0, 0) // получаем состояние чекбокса
						// AkelPad.MessageBox(hWnd, 'Чекбокс = ' + CheckboxState + '\n\n Поле ввода: ' + sText_input, 'Результат', 0x40 /*MB_ICONINFORMATION*/ );
						HexToRGB(sText_input);
						rgb_to_hsb();
						SetColor2(aDlg, sText_input);
						break;
					case ID_CANCEL: // кнопка отмены вызылает окну команду закрытия
						// oSys.Call("User32::PostMessageW", hWnd, 16 /*WM_CLOSE*/ , nLowParam, 0);
						AkelPad.Call("Coder::HighLight", 3, 0)
						break;
						// case ID_CHECKB: // если событие клик на чекбоксе, то есть активно изменить что-либо сразу в окне
						// break;
				}
				break;
			case 16 /*WM_CLOSE*/ : // если событие закрытия окна, то
				oSys.Call("user32::ReleaseDC", aDlg.HWND, hDC); // особождает DC
				oSys.Call("Gdi32::SelectObject", MemDC, hOldBMP); // Выбирает предыдущий объект
				oSys.Call("Gdi32::DeleteDC", MemDC); // особождает копию DC в памяти
				oSys.Call("User32::EndDialog", hWnd, wParam);
				// WScript.Echo("Ушёл"); //  проходит
				break;
			case 2 /*WM_DESTROY*/ : // если событие уничтожения окна, то
				oSys.Call("User32::PostQuitMessage", 0);
				break;
		}

		return 0;
	}

	function InitDialog() {
		var i;
		
		hDC = oSys.Call("User32::GetDC", aDlg.HWND); // получаем контекст устройства
		MemDC = oSys.Call("Gdi32::CreateCompatibleDC", hDC); // получаем совместимый контекст устройства
		
		// Ставит галочку в CheckBox
		AkelPad.SendMessage(aDlg[ID_CHECKB].HWND, 241 /*BM_SETCHECK*/ , 1 /*BST_CHECKED*/ , 0);

		//TrackBar
		AkelPad.SendMessage(aDlg[ID_TB1].HWND, 1044 /*TBM_SETTICFREQE*/ , 10, 0); // TBM_SETTICFREQ =  шкала с шагом 10
		AkelPad.SendMessage(aDlg[ID_TB2].HWND, 1044 /*TBM_SETTICFREQE*/ , 10, 0); // TBM_SETTICFREQ =  шкала с шагом 10
		AkelPad.SendMessage(aDlg[ID_TB3].HWND, 1044 /*TBM_SETTICFREQE*/ , 10, 0); // TBM_SETTICFREQ =  шкала с шагом 10
		// AkelPad.SendMessage(aDlg[ID_TB1].HWND, 1030 /*TBM_SETRANGE*/ , 50, 50); // TBM_SETRANGE =  шкала с шагом 10
		AkelPad.SendMessage(aDlg[ID_TB1].HWND, 1032 /*TBM_SETRANGEMAX*/ , 0, 360); // TBM_SETRANGEMAX =  максимальное значение 360
		AkelPad.SendMessage(aDlg[ID_TB2].HWND, 1032 /*TBM_SETRANGEMAX*/ , 0, 100); // TBM_SETRANGEMAX =  максимальное значение 100
		AkelPad.SendMessage(aDlg[ID_TB3].HWND, 1032 /*TBM_SETRANGEMAX*/ , 0, 100); // TBM_SETRANGEMAX =  максимальное значение 100
		// AkelPad.SendMessage(aDlg[ID_TB1].HWND, 1029 /*TBM_SETPOS*/ , 1, 33); // задать позицию.
		AkelPad.SendMessage(aDlg[ID_TB2].HWND, 1029 /*TBM_SETPOS*/ , 1, arr_hsb[1]); // задать позицию.
		oSys.Call("User32::SetDlgItemTextW", aDlg.HWND, ID_LBTB2, "" + arr_hsb[1]);
		AkelPad.SendMessage(aDlg[ID_TB3].HWND, 1029 /*TBM_SETPOS*/ , 1, arr_hsb[2]); // задать позицию.
		oSys.Call("User32::SetDlgItemTextW", aDlg.HWND, ID_LBTB3, "" + arr_hsb[2]);
		// oSys.Call("User32::SetDlgItemTextW", hWnd, ID_LBTB2, arr_hsb[1] + ' ' + arr_rgb[1] + ' ' + hex(arr_rgb[1]));
		// hsb_to_rgb() // и пересчитываем rgb
		// hImage = LoadImage2(sAkelDir + "\\AkelFiles\\Plugs\\Scripts\\Image\\Spektr.bmp");
		// AkelPad.SendMessage(aDlg[ID_SPEKTR].HWND, 0x0172 /*STM_SETIMAGE*/, 0, hImage);
		SetColor(aDlg.HWND, aDlg);
		

	}

}


/*
function GetOutputWindow() {
	var lpWnd;
	var hWnd = 0;

	if(lpWnd = AkelPad.MemAlloc(_X64 ? 8 : 4)) { // sizeof(HWND)
		AkelPad.Call("Log::Output", 2, lpWnd);
		hWnd = AkelPad.MemRead(lpWnd, 2); // DT_QWORD
		AkelPad.MemFree(lpWnd);
	}
	return hWnd;
}
*/

function SetColor(hWnd, aDlg) {
	hsb_to_rgb()
	var sText = "" + hex(arr_rgb[0]) + hex(arr_rgb[1]) + hex(arr_rgb[2]);
	DrawLBColor(aDlg, sText);
	oSys.Call("User32::SetDlgItemTextW", hWnd, ID_INP, sText);
	if(bChecSt) {
		sBgColor = sText;
		AkelPad.Call("Coder::HighLight", 2, '#' + sFgColor, '#' + sBgColor, 2, 0, ID_Color, sSelText); // пример изменения выделенного цвета (фона)
	}
	else {
		sFgColor = sText;
		AkelPad.Call("Coder::HighLight", 2, '#' + sFgColor, '#' + sBgColor, 2, 0, ID_Color, sSelText); // пример изменения выделенного цвета
	}
	// var nPos = SendMessage(lParam, 1024 /*TBM_GETPOS*/, 0, 0);
	// WScript.Echo("nHiwParam = " + AkelPad.SendMessage(aDlg[ID_TB1].HWND, 1024 /*TBM_GETPOS*/ , 0, 0)); // проходит
	// WScript.Echo("arr_hsb[0] = " + arr_hsb[0] + '\n' + "arr_hsb[1] = " + arr_hsb[1] + '\n' + "arr_hsb[2] = " + arr_hsb[2] + '\n'); // проходит
}

// Применить цвет
function SetColor2(aDlg, sText) {
	AkelPad.SendMessage(aDlg[ID_TB1].HWND, 1029 /*TBM_SETPOS*/ , 1, arr_hsb[0]); // задать позицию.
	AkelPad.SendMessage(aDlg[ID_TB2].HWND, 1029 /*TBM_SETPOS*/ , 1, arr_hsb[1]); // задать позицию.
	AkelPad.SendMessage(aDlg[ID_TB3].HWND, 1029 /*TBM_SETPOS*/ , 1, arr_hsb[2]); // задать позицию.
	oSys.Call("User32::SetDlgItemTextW", aDlg.HWND, ID_LBTB1, "" + arr_hsb[0]);
	oSys.Call("User32::SetDlgItemTextW", aDlg.HWND, ID_LBTB2, "" + arr_hsb[1]);
	oSys.Call("User32::SetDlgItemTextW", aDlg.HWND, ID_LBTB3, "" + arr_hsb[2]);
	if(bChecSt) {
		sBgColor = sText;
		AkelPad.Call("Coder::HighLight", 2, '#' + sFgColor, '#' + sBgColor, 2, 0, ID_Color, sSelText); // пример изменения выделенного цвета (фона)
	}
	else {
		sFgColor = sText;
		AkelPad.Call("Coder::HighLight", 2, '#' + sFgColor, '#' + sBgColor, 2, 0, ID_Color, sSelText); // пример изменения выделенного цвета
	}
	DrawLBColor(aDlg, "" + hex(arr_rgb[0]) + hex(arr_rgb[1]) + hex(arr_rgb[2]));
}

function DrawLBColor(aDlg, Color) {
	hBrush = oSys.Call("Gdi32::CreateSolidBrush", HexToRGB1("#" + Color));

	var rcWnd = getWindowRect(aDlg.HWND);
	if(!rcWnd)
		return;

	var lpRect = AkelPad.MemAlloc(16); //sizeof(RECT)
	if(!lpRect)
		return;

	AkelPad.MemCopy(lpRect, 333, 3 /*DT_DWORD*/);
	AkelPad.MemCopy(lpRect + 4, 20, 3 /*DT_DWORD*/);
	AkelPad.MemCopy(lpRect + 8, 333+80, 3 /*DT_DWORD*/);
	AkelPad.MemCopy(lpRect + 12, 20+40, 3 /*DT_DWORD*/);
	oSys.Call("User32::FillRect", hDC, lpRect, hBrush);
	oSys.Call("Gdi32::DeleteObject", hBrush);
}

// Создаёт градиент с помощью GDI
function Draw_SPEKTR() {
	var arr_hsb_tmp = [arr_rgb[0], arr_rgb[1], arr_rgb[2]]; // кэшируем массив
	w = 260;
	var Color;
	for(var i = 0; i <= w; i++) {
		arr_hsb[0] = i*360/w;
		hsb_to_rgb();
		Color = ((arr_rgb[2] << 8) + arr_rgb[1] << 8) + arr_rgb[0]; // rgb to int
		// Color = parseInt("0x" + hex(arr_rgb[2]) + hex(arr_rgb[1]) + hex(arr_rgb[0]))
		hPen = oSys.Call("gdi32::CreatePen", 0 /* PS_SOLID */ , 1 /* Width */ , Color);
		oSys.Call("Gdi32::SelectObject", hDC, hPen);
		oSys.Call("gdi32::MoveToEx", hDC, i+17, 134, 0); // перемещаем позицию
		oSys.Call("gdi32::LineTo", hDC, i+17, 138);
		oSys.Call("Gdi32::DeleteObject", hPen);
	}
	arr_rgb = [arr_hsb_tmp[0], arr_hsb_tmp[1], arr_hsb_tmp[2]];
}

function getWindowRect(hWnd, hWndParent) {
	var lpRect = AkelPad.MemAlloc(16); //sizeof(RECT)
	if(!lpRect)
		return null;
	oSys.Call("user32::GetWindowRect", hWnd, lpRect);
	hWndParent && oSys.Call("user32::ScreenToClient", hWndParent, lpRect);
	var rcWnd = parseRect(lpRect);
	AkelPad.MemFree(lpRect);
	return rcWnd;
}

function parseRect(lpRect) {
	return {
		left:   AkelPad.MemRead(lpRect,      3 /*DT_DWORD*/),
		top:    AkelPad.MemRead(lpRect +  4, 3 /*DT_DWORD*/),
		right:  AkelPad.MemRead(lpRect +  8, 3 /*DT_DWORD*/),
		bottom: AkelPad.MemRead(lpRect + 12, 3 /*DT_DWORD*/)
	};
}

function HexToRGB1(sHex)
{
  if (/^#[\da-f]{6}$/i.test(sHex))
    return parseInt(sHex.substr(5, 2) + sHex.substr(3, 2) + sHex.substr(1, 2), 16);

  return oSys.Call("User32::GetSysColor", 15);
}

// вытаскивает младшее слово из двойного слова
function LoWord(nDwNum) {
	return nDwNum & 0xFFFF;
}

// вытаскивает старшее слово из двойного слова
function HiWord(nDwNum) {
	return (nDwNum >> 16);
}

// AZJIO
function hsb_to_rgb() {
	var sector;
	var ff, pp, qq, tt;
	var af_rgb = []; // создаём массивы в которых числа будут в диапазоне 0-1
	var af_hsb = [];
	// var arr_rgb = [];

	af_hsb[2] = arr_hsb[2] / 100;

	if(arr_hsb[1] == 0) { // если серый, то одно значение всем
		arr_rgb[0] = Math.round(af_hsb[2] * 255);
		arr_rgb[1] = arr_rgb[0];
		arr_rgb[2] = arr_rgb[0];
		// return arr_rgb;
		return
	}
	else {
		while(arr_hsb[0] >= 360) { // если тон задан большим запредельным числом, то
			arr_hsb[0] -= 360;
		}

		af_hsb[1] = arr_hsb[1] / 100;
		af_hsb[0] = arr_hsb[0] / 60;
		sector = parseInt(af_hsb[0]); // округление до целого
		// sector = Math.ceil(af_hsb[0]); // округление в меньшую сторону

		ff = af_hsb[0] - sector;
		pp = af_hsb[2] * (1 - af_hsb[1]);
		qq = af_hsb[2] * (1 - af_hsb[1] * ff);
		tt = af_hsb[2] * (1 - af_hsb[1] * (1 - ff));

		switch(sector) {
			case 0:
				af_rgb[0] = af_hsb[2];
				af_rgb[1] = tt;
				af_rgb[2] = pp;
				break;
			case 1:
				af_rgb[0] = qq;
				af_rgb[1] = af_hsb[2];
				af_rgb[2] = pp;
				break;
			case 2:
				af_rgb[0] = pp;
				af_rgb[1] = af_hsb[2];
				af_rgb[2] = tt;
				break;
			case 3:
				af_rgb[0] = pp;
				af_rgb[1] = qq;
				af_rgb[2] = af_hsb[2];
				break;
			case 4:
				af_rgb[0] = tt;
				af_rgb[1] = pp;
				af_rgb[2] = af_hsb[2];
				break;
			default:
				af_rgb[0] = af_hsb[2];
				af_rgb[1] = pp;
				af_rgb[2] = qq;
		}
	}
	// RGB
	arr_rgb[0] = Math.round(af_rgb[0] * 255);
	arr_rgb[1] = Math.round(af_rgb[1] * 255);
	arr_rgb[2] = Math.round(af_rgb[2] * 255);

	// BGR
	/*
	arr_rgb[2] = Math.round(af_rgb[0] * 255);
	arr_rgb[1] = Math.round(af_rgb[1] * 255);
	arr_rgb[0] = Math.round(af_rgb[2] * 255);
	*/

	// return arr_rgb
}

// AZJIO
function rgb_to_hsb() {
	var min, max;

	if(arr_rgb[0] <= arr_rgb[1]) {
		min = arr_rgb[0];
		max = arr_rgb[1];
	}
	else {
		min = arr_rgb[1];
		max = arr_rgb[0];
	}

	if(min > arr_rgb[2]) {
		min = arr_rgb[2];
	}

	if(max < arr_rgb[2]) {
		max = arr_rgb[2];
	}

	if(max == min) {
		arr_hsb[0] = 0;
	}
	else if(max == arr_rgb[0]) {
		arr_hsb[0] = 60 * (arr_rgb[1] - arr_rgb[2]) / (max - min);
		if(arr_rgb[1] < arr_rgb[2])
			arr_hsb[0] += 360;
	}
	else if(max == arr_rgb[1]) {
		arr_hsb[0] = (60 * (arr_rgb[2] - arr_rgb[0]) / (max - min)) + 120;
	}
	else if(max == arr_rgb[2]) {
		arr_hsb[0] = 60 * (arr_rgb[0] - arr_rgb[1]) / (max - min) + 240;
	}

	if(max == 0) {
		arr_hsb[1] = 0;
	}
	else {
		arr_hsb[1] = (1 - min / max) * 100;
	}

	arr_hsb[2] = max / 255 * 100;

	arr_hsb[0] = Math.round(arr_hsb[0]);
	arr_hsb[1] = Math.round(arr_hsb[1]);
	arr_hsb[2] = Math.round(arr_hsb[2]);

	// return arr_hsb
}

function hex(n) { // взял из "colorsConverter.js"
	var h = (typeof n == "number" ? n : parseInt(n, 10)).toString(16);
	if(h.length > 2)
		return null;
	return "00".substr(h.length) + h;
}

function HexToRGB(sHex) {
	if(/^[\da-f]{6}$/i.test(sHex)) { // валидация
		arr_rgb[0] = parseInt(sHex.substr(0, 2), 16);
		arr_rgb[1] = parseInt(sHex.substr(2, 2), 16);
		arr_rgb[2] = parseInt(sHex.substr(4, 2), 16);
	}
}

// Загрузка рисунка спектра из файла, теперь вместо этого Draw_SPEKTR
function LoadImage2(sFile) {
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	if (!fso.FileExists(sFile))
		return 0;
	var lpFile = AkelPad.MemAlloc(260 * 2); // Выделяем память и получаем указатель
	AkelPad.MemCopy(lpFile, sFile, 1 /*DT_UNICODE*/); // Копируем путь в указатель
	var hImage = oSys.Call("User32::LoadImageW", 0, lpFile, 0, 0, 0, 8304); // 16+64+8192+32
	AkelPad.MemFree(lpFile);
	return hImage;
}


function GetNewMarkID(id)
{
	//based on Instructor's code GetMarks.js: http://akelpad.sourceforge.net/forum/viewtopic.php?p=25591&highlight=#25591
	var aCur = [];
	var lpMarkStack = AkelPad.MemAlloc(_X64 ? 16 : 8 /*sizeof(STACKMARKTEXT)*/);
	var lpMarkText;
	var nMarkID;
	var i;
	// var id = 100;
	var flaf = 0;
	
	aCur.length = 0;
	
	AkelPad.Call("Coder::HighLight", 12 /*DLLA_HIGHLIGHT_GETMARKSTACK*/, AkelPad.GetEditWnd(), AkelPad.GetEditDoc(), lpMarkStack);

	lpMarkText = AkelPad.MemRead(lpMarkStack /*offsetof(STACKMARKTEXT,first)*/, 2 /*DT_QWORD*/);
	
	while (lpMarkText) {
	    nMarkID    = AkelPad.MemRead(_PtrAdd(lpMarkText, _X64 ? 24 : 12) /*offsetof(MARKTEXT,dwMarkID)*/, 3 /*DT_DWORD*/);
		aCur.push([nMarkID]);
		lpMarkText = AkelPad.MemRead(lpMarkText /*offsetof(MARKTEXT,next)*/, 2 /*DT_QWORD*/);
	}
	
	AkelPad.MemFree(lpMarkStack);

// поиск свободного ID
	do {
		flaf = 0;
		id +=1
		for (i = 0; i < aCur.length; i++) {
			if (aCur[i] == id) {
				flaf = 1;
				break
			}
		}
	} while (flaf)
	return id
}