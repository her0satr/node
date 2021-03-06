var Func = {
    base: (typeof(web) != 'undefined' && typeof(web.base) != 'undefined') ? web.base : '',
	ajax: function(p) {
		p.is_json = (p.is_json == null) ? true : p.is_json;
		
		$.ajax({ type: 'POST', url: p.url, data: p.param, success: function(data) {
			if (p.is_json == 1) {
				eval('var result = ' + data);
				p.callback(result);
			} else {
				p.callback(data);
			}
		} });
	},
	array_to_json: function(Data) {
		var temp = '';
		for (var i = 0; i < Data.length; i++) {
			temp = (temp.length == 0) ? Func.object_to_json(Data[i]) : temp + ',' + Func.object_to_json(Data[i]);
		}
		return '[' + temp + ']';
	},
	datatable: function(p) {
		/*
		var param = {
			id: 'datatables', aaSorting: [[ 1, "DESC" ]],
			source: 'helper/datatable.php',
			column: [ { sWidth: '50%' }, { }, { } , { bSortable: false, sClass: 'center' } ],
			callback: function() {
				$('#datatables .btn-detail').click(function() {
					var raw_record = $(this).siblings('.hide').text();
					eval('var record = ' + raw_record);
					
					Func.populate({ cnt: '#modal-submission', record: record });
					$('#modal-submission').modal();
				});
			}
		}
		param.fnServerParams = function(aoData) {
			aoData.push( { "name": "is_publish", "value": "1" } );
			param.server_param = aoData;
		}
		var dt = Func.datatable(param);
		/*	*/
		var cnt_id = '#' + p.id;
		
		var dt_param = {
			"aoColumns": p.column,
			"sAjaxSource": p.source,
			"bProcessing": true, "bServerSide": true, "sServerMethod": "POST", "sPaginationType": "full_numbers",
			"oLanguage": {
				"sSearch": "<span>Search:</span> ",
				"sInfo": "Showing <span>_START_</span> to <span>_END_</span> of <span>_TOTAL_</span> entries",
				"sLengthMenu": "_MENU_ <span>entries per page</span>"
			},
			"fnDrawCallback": function (oSettings) {
				// init tooltips
				$(cnt_id + ' .tool-tip').tooltip({ placement: 'top' });
				
				if (p.callback != null) {
					p.callback();
				}
			}
		}
		if (p.fnServerParams != null) {
			dt_param.fnServerParams = p.fnServerParams;
		}
		if (p.aaSorting != null) {
			dt_param.aaSorting = p.aaSorting;
		}
		if (p.bPaginate != null) {
			dt_param.bPaginate = p.bPaginate;
		}
		
		var table = $(cnt_id).dataTable(dt_param);
		
		// initiate
		if (p.init != null) {
			p.init();
		}
		
		var dt = {
			table: table,
			reload: function() {
				if ($(cnt_id + '_paginate .paginate_active').length > 0) {
					$(cnt_id + '_paginate .paginate_active').click();
				} else {
					$(cnt_id + '_length select').change();
				}
			},
			get_param: function(option) {
				option.return_type = (option.return_type == null) ? 'object' : 'array';
				if (option.return_type == 'array') {
					var result = p.server_param;
				} else if (option.return_type == 'object') {
					var result = {};
					for (var i = 0; i < p.server_param.length; i++) {
						result[p.server_param[i].name] = p.server_param[i].value;
					}
				}
				
				return result;
			}
		}
		
		// init search
		$(cnt_id).parents('.panel-table').find('.btn-search').click(function() {
			var value = $(cnt_id).parents('.panel-table').find('.input-keyword').val();
			dt.table.fnFilter( value );
		});
		
		return dt;
	},
	get_name: function(value) {
		var result = value.trim().replace(new RegExp(/[^0-9a-z]+/gi), '_').toLowerCase();
		return result;
	},
	in_array: function(Value, Array) {
		var Result = false;
		for (var i = 0; i < Array.length; i++) {
			if (Value == Array[i]) {
				Result = true;
				break
			}
		}
		return Result;
	},
	is_empty: function(value) {
		var Result = false;
		if (value == null || value == 0) {
			Result = true;
		} else if (typeof(value) == 'string') {
			value = Helper.Trim(value);
			if (value.length == 0) {
				Result = true;
			}
		}
		
		return Result;
	},
	object_to_link: function(obj) {
		var str = '';
		for (var p in obj) {
			if (obj.hasOwnProperty(p)) {
				if (p.length > 0 && obj[p] != null) {
					str += (str.length == 0) ? str : '&';
					str += p + '=' + obj[p];
				}
			}
		}
		return str;
	},
	object_to_json: function(obj) {
		var str = '';
		for (var p in obj) {
			if (obj.hasOwnProperty(p)) {
				if (obj[p] != null) {
					var value = obj[p].toString();
					value = value.replace(new RegExp('[\'\"]', 'gi'), '`');
					str += (str.length == 0) ? str : ',';
					str += '"' + p + '":"' + value + '"';
				}
			}
		}
		str = '{' + str + '}';
		return str;
	},
	populate: function(p) {
		for (var form_name in p.record) {
			if (p.record.hasOwnProperty(form_name)) {
				var input = $(p.cnt + ' [name="' + form_name + '"]');
				var value = p.record[form_name];
				
				if (input.attr('type') == 'radio') {
					input.filter('[value=' + value.toString() + ']').prop('checked', true);
				} else if (input.attr('type') == 'checkbox') {
					input.prop('checked', false);
					if (value == 1) {
						input.prop('checked', true);
					}
				} else if (input.hasClass('datepicker') || input.hasClass('dtpicker')) {
					input.val(Func.swap_date(value));
				} else {
					input.val(value);
				}
			}
		}
	},
	str_pad: function(input, pad_length, pad_string, pad_type) {
		//   example 1: str_pad('Kevin van Zonneveld', 30, '-=', 'STR_PAD_LEFT');
		//   returns 1: '-=-=-=-=-=-Kevin van Zonneveld'
		//   example 2: str_pad('Kevin van Zonneveld', 30, '-', 'STR_PAD_BOTH');
		//   returns 2: '------Kevin van Zonneveld-----'

		var half = '',
		pad_to_go;

		var str_pad_repeater = function(s, len) {
			var collect = '',
			  i;

			while (collect.length < len) {
				collect += s;
			}
			collect = collect.substr(0, len);

			return collect;
		};

		input += '';
		pad_string = pad_string !== undefined ? pad_string : ' ';

		if (pad_type !== 'STR_PAD_LEFT' && pad_type !== 'STR_PAD_RIGHT' && pad_type !== 'STR_PAD_BOTH') {
			pad_type = 'STR_PAD_RIGHT';
		}
		if ((pad_to_go = pad_length - input.length) > 0) {
			if (pad_type === 'STR_PAD_LEFT') {
				input = str_pad_repeater(pad_string, pad_to_go) + input;
			} else if (pad_type === 'STR_PAD_RIGHT') {
				input = input + str_pad_repeater(pad_string, pad_to_go);
			} else if (pad_type === 'STR_PAD_BOTH') {
				half = str_pad_repeater(pad_string, Math.ceil(pad_to_go / 2));
				input = half + input + half;
				input = input.substr(0, pad_length);
			}
		}

		return input;
	},
	swap_date: function(value) {
		if (value == null) {
			return '';
		}
		
		var array_value = value.split('-');
		if (array_value.length != 3) {
			return '';
		}
		
		return array_value[2] + '-' + array_value[1] + '-' + array_value[0];
	},
	trim: function(value) {
		return value.replace(/^\s+|\s+$/g,'');
	},
    form: {
        get_value: function(container) {
			var PrefixCheck = container.substr(0, 1);
			if (! Func.in_array(PrefixCheck, ['.', '#'])) {
				container = '#' + container;
			}
			
            var data = Object();
			var set_value = function(obj, name, value) {
				if (typeof(name) == 'undefined') {
					return obj;
				} else if (name.length < 3) {
					obj[name] = value;
					return obj;
				}
				
				var endfix = name.substr(name.length - 2, 2);
				if (endfix == '[]') {
					var name_valid = name.replace(endfix, '');
					if (obj[name_valid] == null) {
						obj[name_valid] = [];
					}
					obj[name_valid].push(value);
				} else {
					obj[name] = value;
				}
				
				return obj;
			}
            
            var Input = jQuery(container + ' input, ' + container + ' select, ' + container + ' textarea');
            for (var i = 0; i < Input.length; i++) {
				var name = Input.eq(i).attr('name');
				var value = Input.eq(i).val();
				
				if (Input.eq(i).attr('type') == 'checkbox') {
					if (Input.eq(i).is(':checked')) {
						data = set_value(data, name, value);
					} else {
						data = set_value(data, name, 0);
					}
				} else if (Input.eq(i).attr('type') == 'radio') {
					value = $(container + ' [name="' + name + '"]:checked').val();
					data = set_value(data, name, value);
				} else if (Input.eq(i).hasClass('datepicker') || Input.eq(i).hasClass('dtpicker')) {
					data = set_value(data, name, Func.swap_date(value));
				} else {
					data = set_value(data, name, value);
				}
            }
			
            return data;
        },
		submit: function(p) {
			Func.ajax({ url: p.url, param: p.param, callback: function(result) {
				if (result.status == true) {
					if (result.message.length > 0) {
						noty({ text: result.message, layout: 'topRight', type: 'success', timeout: 1500 });
					}
					
					if (p.callback != null) {
						p.callback(result);
					}
				} else {
					noty({ text: result.message, layout: 'topRight', type: 'error', timeout: 1500 });
				}
			} });
		},
		confirm_delete: function(p) {
			var cnt_modal = '';
			cnt_modal += '<div id="cnt-confirm" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">';
			cnt_modal += '<div class="modal-dialog">';
			cnt_modal += '<div class="modal-content">';
			cnt_modal += '<div class="modal-header">';
			cnt_modal += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
			cnt_modal += '<h4 class="modal-title">Confirmation</h4>';
			cnt_modal += '</div>';
			cnt_modal += '<div class="modal-body">';
			cnt_modal += '<p>Are you sure ?</p>';
			cnt_modal += '</div>';
			cnt_modal += '<div class="modal-footer">';
			cnt_modal += '<button type="button" class="btn btn-close btn-default" data-dismiss="modal" aria-hidden="true">No</button>';
			cnt_modal += '<button type="button" class="btn btn-primary">Yes</button>';
			cnt_modal += '</div>';
			cnt_modal += '</div>';
			cnt_modal += '</div>';
			cnt_modal += '</div>';
			$('#cnt-temp').html(cnt_modal);
			$('#cnt-confirm').modal();
			
			$('#cnt-confirm .btn-primary').click(function() {
				$.ajax({ type: "POST", url: p.url, data: p.data }).done(function( RawResult ) {
					eval('var result = ' + RawResult);
					
					$('#cnt-confirm .btn-close').click();
					if (result.status == 1) {
						noty({ text: result.message, layout: 'topRight', type: 'success', timeout: 1500 });
					} else {
						noty({ text: result.message, layout: 'topRight', type: 'error', timeout: 1500 });
					}
					
					if (p.callback != null) {
						p.callback();
					}
				});
			});
		}
    }
}
