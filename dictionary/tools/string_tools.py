import logging
import os
import sys
import time


def replace_single_quotation(original_str):
    replace_str = "'"
    keyword = original_str
    if (original_str.find(replace_str) >= 0):
        part_keyword = original_str.partition(replace_str)
        #print(part_keyword[0])
        keyword = part_keyword[0] + "\'\'" + replace_single_quotation(part_keyword[2])
        #print(keyword).

    return keyword