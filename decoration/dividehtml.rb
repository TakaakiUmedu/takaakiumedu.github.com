#!/usr/bin/ruby
#coding:utf-8
Encoding.default_external = __ENCODING__

src = open($*[0]){|file|
	file.read
}

raise unless src =~ /<h(\d) class="header">.*?<\/h\1>/
header = $` + $&

raise unless src =~ /<h(\d) class="footer">.*?<\/h\1>/
footer = $& + $'

src.gsub!(/<div class="CAUTION">.*?<\/div>/m, "</h1>\n<p><a href=\"index.html\">display all samples all together / サンプルを全て表示</a></p>\n")

open("index_s.html", "w"){|file|
	while src =~ /<h(\d) class="sample">(.*?)<\/h\1>/
		body = $`
		tag = $&
		title = $2
		src = $'
		name = title.gsub(/[^A-Za-z0-9_-]/, '')
		
		raise unless src =~ /<h\d /
		sample_body = $`
		src = $& + $'
		
		file.write(body)
		file.write("<p id=\"sample_#{name}\"><a href=\"#{name}.html\">#{title}</a></p>")
		open("#{name}.html", "w"){|sample_file|
			sample_file.write(header.gsub(/<\/title>/, " : #{title}</title>"))
			sample_file.write("<p><a href=\"index_s.html#sample_#{name}\">return to main page / 全体の説明へ戻る</a></p>")
			sample_file.write(tag)
			sample_file.write(sample_body)
			sample_file.write(footer);
		}
	end
	file.write(src)
}

